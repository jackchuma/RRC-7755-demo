"use server";

import HashiProof from "@/abis/HashiProof";
import Outbox from "@/abis/Outbox";
import bytes32ToAddress from "@/utils/bytes32ToAddress";
import { isHashiProofType } from "@/utils/isHashiProofType";
import { Call } from "@/utils/types/call";
import { ProofType } from "@/utils/types/proof";
import { Request } from "@/utils/types/request";
import {
  Address,
  encodeAbiParameters,
  EncodeAbiParametersReturnType,
  encodeFunctionData,
} from "viem";

export type BuildClaimRewardCallResponse = {
  success: boolean;
  data: { calls: Call[] };
};

export async function buildClaimRewardCall(
  req: Request,
  proof: ProofType,
  address: Address
): Promise<BuildClaimRewardCallResponse> {
  console.log("buildClaimRewardCall");
  const encodedProof = encodeProof(proof);
  const calls: Call[] = [
    {
      to: bytes32ToAddress(req.sender),
      data: encodeFunctionData({
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
      }),
    },
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
