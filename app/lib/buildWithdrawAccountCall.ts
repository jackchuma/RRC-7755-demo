"use server";

import MockAccountTracker from "@/abis/MockAccountTracker";
import chains from "@/config/chains";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData, formatEther } from "viem";

type WithdrawAccountCallResponse = {
  success: boolean;
  data: { calls: Call[]; amount: number };
};

export async function buildWithdrawAccountCall(
  chainId: number,
  address: Address,
  token: Address
): Promise<WithdrawAccountCallResponse> {
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
