"use server";

import HashiProof from "@/abis/HashiProof";
import Outbox from "@/abis/Outbox";
import bytes32ToAddress from "@/utils/bytes32ToAddress";
import decodeUserOp from "@/utils/decodeUserOp";
import { isHashiProofType } from "@/utils/isHashiProofType";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { ProofType } from "@/utils/types/proof";
import { Request, RequestType } from "@/utils/types/request";
import {
  Address,
  encodeAbiParameters,
  EncodeAbiParametersReturnType,
  encodeFunctionData,
} from "viem";

export async function buildClaimRewardCall(
  req: Request,
  proof: ProofType,
  address: Address
): Promise<BuildCallsResponse> {
  console.log("buildClaimRewardCall");
  const encodedProof = encodeProof(proof);

  let data = encodeFunctionData({
    abi: Outbox,
    functionName: "claimReward",
    args: [
      req.dstChain,
      req.receiver,
      req.payload,
      req.attributes,
      encodedProof,
      address,
    ],
  });

  if (req.requestType === RequestType.SmartAccount) {
    const userOp = decodeUserOp(req.payload);
    data = encodeFunctionData({
      abi: Outbox,
      functionName: "claimReward",
      args: [req.dstChain, req.receiver, userOp, encodedProof, address],
    });
  }

  const calls: Call[] = [
    { to: bytes32ToAddress(req.sender), data, value: BigInt(0) },
  ];

  return { success: true, data: { calls } };
}

function encodeProof(proof: ProofType): EncodeAbiParametersReturnType {
  if (isHashiProofType(proof)) {
    return encodeAbiParameters(HashiProof, [proof]);
  } else {
    throw new Error("Unknown proof type");
  }
}
