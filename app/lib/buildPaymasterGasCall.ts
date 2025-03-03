"use server";

import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { encodeFunctionData, parseEther } from "viem";

export async function buildPaymasterGasCall(
  chainId: number
): Promise<BuildCallsResponse> {
  const chainConfig = chains[chainId];
  const amount = parseEther("0.005");

  const calls: Call[] = [
    {
      to: chainConfig.contracts.paymaster,
      data: encodeFunctionData({
        abi: Paymaster,
        functionName: "entryPointDeposit",
        args: [amount],
      }),
      value: amount,
    },
  ];
  return { success: true, data: { calls } };
}
