"use server";

import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { BuildCallsResponse } from "@/utils/types/buildCallsReponse";
import { Call } from "@/utils/types/call";
import { Token, TokenType } from "@/utils/types/tokenType";
import { encodeFunctionData, parseEther } from "viem";

export async function buildMagicSpendCall(
  dstChainId: number,
  token: Token,
  amount: number
): Promise<BuildCallsResponse> {
  const chainConfig = chains[dstChainId];
  if (!chainConfig) {
    return { success: false, data: { calls: [] } };
  }

  const amountWei = parseEther(amount.toString());
  const data =
    token.id === TokenType.ETH
      ? "0x"
      : encodeFunctionData({
          abi: Paymaster,
          functionName: "magicSpendDeposit",
          args: [token.address, amountWei],
        });
  const value = token.id === TokenType.ETH ? amountWei : BigInt(0);

  const calls: Call[] = [{ to: chainConfig.contracts.paymaster, data, value }];

  return { success: true, data: { calls } };
}
