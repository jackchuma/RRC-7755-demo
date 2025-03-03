"use server";

import Inbox from "@/abis/Inbox";
import bytes32ToAddress from "@/utils/bytes32ToAddress";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Request } from "@/utils/types/request";
import { Address, encodeFunctionData } from "viem";

export async function buildFulfillmentCall(
  req: Request,
  address: Address
): Promise<BuildCallsResponse> {
  console.log("buildFulfillmentCall");
  const args: any = [
    req.srcChain,
    req.sender,
    req.payload,
    req.attributes,
    address,
  ];

  const calls: Call[] = [
    {
      to: bytes32ToAddress(req.receiver),
      data: encodeFunctionData({ abi: Inbox, functionName: "fulfill", args }),
      value: BigInt(0),
    },
  ];

  return { success: true, data: { calls } };
}
