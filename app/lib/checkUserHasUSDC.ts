"use server";

import { Address } from "viem";
import chains from "@/config/chains";
import { tokens } from "@/config/tokens";
import { TokenType } from "@/utils/types/tokenType";
import { getBalances } from "./getBalances";

export async function checkUserHasUSDC(address: Address): Promise<boolean> {
  try {
    const usdcToken = tokens.find((token) => token.id === TokenType.USDC);
    if (!usdcToken) {
      throw new Error("USDC token configuration not found");
    }

    // Check balances on all supported chains
    const chainIds = Object.keys(chains).map(Number);

    for (const chainId of chainIds) {
      const balanceResponse = await getBalances(chainId, usdcToken, address);

      if (balanceResponse.success) {
        const { balances } = balanceResponse.data;

        // Check if user has any USDC in any of the balance categories
        if (
          balances.account > 0 ||
          balances.fulfiller > 0 ||
          balances.paymaster > 0
        ) {
          return true;
        }
      }
    }

    // If we've checked all chains and found no USDC, return false
    return false;
  } catch (error) {
    console.error("Error checking if user has USDC:", error);
    // Default to false if there's an error
    return false;
  }
}
