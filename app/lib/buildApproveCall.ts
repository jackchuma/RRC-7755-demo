"use server";

import MockToken from "@/abis/MockToken";
import chains from "@/config/chains";
import { calculateRewardAmount } from "@/utils/calculateRewardAmount";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Address, encodeFunctionData, parseEther } from "viem";

export async function buildApproveCall(
  tokenAddress: Address,
  chainId: number,
  approveAccount: boolean,
  amount: number,
  calcReward: boolean
): Promise<BuildCallsResponse> {
  const { contracts } = chains[chainId];
  const addr = approveAccount
    ? contracts.mockAccountTracker
    : contracts.paymaster;
  const amountToApprove = calcReward ? calculateRewardAmount(amount) : amount;
  const calls: Call[] = [
    {
      to: tokenAddress,
      data: encodeFunctionData({
        abi: MockToken,
        functionName: "approve",
        args: [addr, parseEther(amountToApprove.toString())],
      }),
    },
  ];
  return { success: true, data: { calls } };
}
