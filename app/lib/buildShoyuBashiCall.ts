"use server";

import ShoyuBashi from "@/abis/ShoyuBashi";
import Attributes from "@/utils/attributes";
import decodeUserOp from "@/utils/decodeUserOp";
import extractAttributesFromUserOp from "@/utils/extractAttributesFromUserOp";
import { isHashiProofType } from "@/utils/isHashiProofType";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { ProofType } from "@/utils/types/proof";
import { Request, RequestType } from "@/utils/types/request";
import {
  decodeAbiParameters,
  encodeFunctionData,
  fromRlp,
  Hex,
  keccak256,
} from "viem";

export async function buildShoyuBashiCall(
  req: Request,
  proof: ProofType
): Promise<BuildCallsResponse> {
  console.log("buildShoyuBashiCall");
  const [dstChainId] = decodeAbiParameters([{ type: "uint256" }], req.dstChain);
  let attributes = new Attributes(req.attributes);

  if (req.requestType === RequestType.SmartAccount) {
    attributes = extractAttributesFromUserOp(decodeUserOp(req.payload));
  }

  if (!isHashiProofType(proof)) {
    throw new Error("Proof is not a HashiProofType");
  }

  const { rlpEncodedBlockHeader } = proof;

  const blockHash = keccak256(rlpEncodedBlockHeader);
  const l2BlockNumber = extractBlockNumber(rlpEncodedBlockHeader);

  const calls: Call[] = [
    {
      to: attributes.getShoyuBashi(),
      data: encodeFunctionData({
        abi: ShoyuBashi,
        functionName: "setHash",
        args: [dstChainId, l2BlockNumber, blockHash],
      }),
      value: BigInt(0),
    },
  ];
  return { success: true, data: { calls } };
}

function extractBlockNumber(rlpEncodedBlockHeader: Hex): bigint {
  const decoded = fromRlp(rlpEncodedBlockHeader);
  return BigInt(decoded[8] as Hex);
}
