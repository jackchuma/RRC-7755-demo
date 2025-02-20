"use server";

import Inbox from "@/abis/Inbox";
import bytes32ToAddress from "@/utils/bytes32ToAddress";
import { Call } from "@/utils/types/call";
import { Request } from "@/utils/types/request";
import { Address, encodeFunctionData } from "viem";

export type BuildFulfillmentCallResponse = {
  success: boolean;
  data: { calls: Call[] };
};

export async function buildFulfillmentCall(
  req: Request,
  address: Address
): Promise<BuildFulfillmentCallResponse> {
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
      data: encodeFunctionData({
        abi: Inbox,
        functionName: "fulfill",
        args,
      }),
      value: req.dstValue,
    },
  ];

  return { success: true, data: { calls } };
}
