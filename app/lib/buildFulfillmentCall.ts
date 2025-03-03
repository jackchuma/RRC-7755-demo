"use server";

import EntryPoint from "@/abis/EntryPoint";
import Inbox from "@/abis/Inbox";
import bytes32ToAddress from "@/utils/bytes32ToAddress";
import decodeUserOp from "@/utils/decodeUserOp";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Request, RequestType } from "@/utils/types/request";
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

  let data = encodeFunctionData({ abi: Inbox, functionName: "fulfill", args });

  if (req.requestType === RequestType.SmartAccount) {
    console.log("Building smart account fulfillment");
    const op = decodeUserOp(req.payload);
    data = encodeFunctionData({
      abi: EntryPoint,
      functionName: "handleOps",
      args: [[op], address],
    });
  }

  const calls: Call[] = [
    { to: bytes32ToAddress(req.receiver), data, value: BigInt(0) },
  ];

  return { success: true, data: { calls } };
}
