"use server";

import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData, formatEther } from "viem";
import { WithdrawCallResponse } from "./buildWithdrawMagicSpendCall";

export async function buildWithdrawGasCall(
  chainId: number,
  address: Address
): Promise<WithdrawCallResponse> {
  const chainConfig = chains[chainId];

  const amount = await chainConfig.publicClient.readContract({
    address: chainConfig.contracts.paymaster,
    abi: Paymaster,
    functionName: "getGasBalance",
    args: [address],
  });

  const calls: Call[] = [
    {
      to: chainConfig.contracts.paymaster,
      data: encodeFunctionData({
        abi: Paymaster,
        functionName: "entryPointWithdrawTo",
        args: [address, amount],
      }),
      value: BigInt(0),
    },
  ];

  return { success: true, data: { calls, amount: +formatEther(amount) } };
}
