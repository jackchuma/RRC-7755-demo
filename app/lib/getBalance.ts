"use server";

import MockToken from "@/abis/MockToken";
import chains from "@/config/chains";
import { tokens } from "@/config/tokens";
import { Balance } from "@/utils/types/balance";
import { TokenType } from "@/utils/types/tokenType";
import { Address, formatEther } from "viem";

export type GetBalanceResponse = {
  success: boolean;
  data: { balance: Balance };
};

export async function getBalance(address: Address, chainId: number) {
  console.log("Getting balance for address:", address, "on chainId:", chainId);
  const chainConfig = chains[chainId];

  if (!chainConfig) {
    throw new Error(`Chain config not found for chainId: ${chainId}`);
  }

  const token = tokens.find((token) => token.id === TokenType.USDC);

  if (!token) {
    throw new Error(`Token not found for USDC`);
  }

  const { publicClient } = chainConfig;

  const [ethBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address }),
    publicClient.readContract({
      address: token.address,
      abi: MockToken,
      functionName: "balanceOf",
      args: [address],
    }),
  ]);
  const balance = {
    [TokenType.ETH]: +formatEther(ethBalance),
    [TokenType.USDC]: +formatEther(usdcBalance),
  };

  return { success: true, data: { balance } };
}
