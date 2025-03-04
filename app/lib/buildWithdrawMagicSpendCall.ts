"use server";

import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData, formatEther } from "viem";

export type WithdrawCallResponse = {
  success: boolean;
  data: { calls: Call[]; amount: number };
};

export async function buildWithdrawMagicSpendCall(
  chainId: number,
  token: Address,
  address: Address
): Promise<WithdrawCallResponse> {
  const chainConfig = chains[chainId];

  const amount = await chainConfig.publicClient.readContract({
    address: chainConfig.contracts.paymaster,
    abi: Paymaster,
    functionName: "getMagicSpendBalance",
    args: [address, token],
  });

  const calls: Call[] = [
    {
      to: chainConfig.contracts.paymaster,
      data: encodeFunctionData({
        abi: Paymaster,
        functionName: "withdrawTo",
        args: [token, address, amount],
      }),
      value: BigInt(0),
    },
  ];

  return { success: true, data: { calls, amount: +formatEther(amount) } };
}
