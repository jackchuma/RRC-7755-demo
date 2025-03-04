"use server";

import MockAccountTracker from "@/abis/MockAccountTracker";
import chains from "@/config/chains";
import { calculateRewardAmount } from "@/utils/calculateRewardAmount";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Token, TokenType } from "@/utils/types/tokenType";
import { encodeFunctionData, parseEther } from "viem";

export async function buildFundMockAccountCall(
  chainId: number,
  token: Token,
  amount: number
): Promise<BuildCallsResponse> {
  const chainConfig = chains[chainId];

  if (!chainConfig) {
    throw new Error(`Chain config not found for chainId: ${chainId}`);
  }

  const amountWei = parseEther(calculateRewardAmount(amount).toString());

  const calls: Call[] = [
    {
      to: chainConfig.contracts.mockAccountTracker,
      data: encodeFunctionData({
        abi: MockAccountTracker,
        functionName: "deposit",
        args: [token.address, amountWei],
      }),
      value: token.id === TokenType.ETH ? amountWei : undefined,
    },
  ];

  return { success: true, data: { calls } };
}
