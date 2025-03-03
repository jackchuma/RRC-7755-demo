"use server";

import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData } from "viem";

export async function buildWithdrawMagicSpendCall(
  chainId: number,
  token: Address,
  address: Address
): Promise<BuildCallsResponse> {
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

  return { success: true, data: { calls } };
}
