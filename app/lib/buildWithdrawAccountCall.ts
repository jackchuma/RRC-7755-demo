"use server";

import MockAccountTracker from "@/abis/MockAccountTracker";
import chains from "@/config/chains";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData, formatEther } from "viem";
import { WithdrawCallResponse } from "./buildWithdrawMagicSpendCall";

export async function buildWithdrawAccountCall(
  chainId: number,
  address: Address,
  token: Address
): Promise<WithdrawCallResponse> {
  console.log("Building withdraw account call");
  const chainConfig = chains[chainId];

  const amount = await chainConfig.publicClient.readContract({
    address: chainConfig.contracts.mockAccountTracker,
    abi: MockAccountTracker,
    functionName: "balanceOf",
    args: [address, token],
  });

  const calls: Call[] = [
    {
      to: chainConfig.contracts.mockAccountTracker,
      data: encodeFunctionData({
        abi: MockAccountTracker,
        functionName: "withdraw",
        args: [token, amount],
      }),
      value: BigInt(0),
    },
  ];

  return { success: true, data: { calls, amount: +formatEther(amount) } };
}
