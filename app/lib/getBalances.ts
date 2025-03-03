"use server";

import MockAccountTracker from "@/abis/MockAccountTracker";
import MockToken from "@/abis/MockToken";
import Paymaster from "@/abis/Paymaster";
import chains from "@/config/chains";
import { ChainConfig } from "@/utils/types/chainConfig";
import { Token, TokenType } from "@/utils/types/tokenType";
import { Address, formatEther } from "viem";

export type Balances = {
  account: number;
  fulfiller: number;
  outbox: number;
  paymaster: number;
  entryPoint: number;
};

export type GetBalancesResponse = {
  success: boolean;
  data: { balances: Balances };
};

export async function getBalances(
  chainId: number,
  token: Token,
  address: Address
): Promise<GetBalancesResponse> {
  console.log("Getting balance on chainId:", chainId);
  const chainConfig = chains[chainId];

  if (!chainConfig) {
    throw new Error(`Chain config not found for chainId: ${chainId}`);
  }

  const balances = await getETHBalances(chainConfig, token, address);

  return { success: true, data: { balances } };
}

async function getETHBalances(
  chain: ChainConfig,
  token: Token,
  address: Address
): Promise<Balances> {
  const { publicClient } = chain;

  const contracts: any = [
    {
      address: chain.contracts.mockAccountTracker,
      abi: MockAccountTracker,
      functionName: "balanceOf",
      args: [address, token.address],
    },
    {
      address: chain.contracts.paymaster,
      abi: Paymaster,
      functionName: "getMagicSpendBalance",
      args: [address, token.address],
    },
    {
      address: chain.contracts.paymaster,
      abi: Paymaster,
      functionName: "getGasBalance",
      args: [address],
    },
  ];

  if (token.id === TokenType.USDC) {
    contracts.push(
      {
        address: token.address,
        abi: MockToken,
        functionName: "balanceOf",
        args: [address],
      },
      {
        address: token.address,
        abi: MockToken,
        functionName: "balanceOf",
        args: [chain.contracts.outboxContracts.Hashi],
      }
    );
  }

  const calls = [publicClient.multicall({ contracts })];

  if (token.id === TokenType.ETH) {
    calls.push(
      publicClient.getBalance({ address }),
      publicClient.getBalance({
        address: chain.contracts.outboxContracts.Hashi,
      })
    );
  }

  const [multiCallResults, ...otherResults] = await Promise.all(calls);
  const [
    accountResult,
    paymasterResult,
    entryPointResult,
    ...otherMulticallResults
  ] = multiCallResults;
  let fulfillerBalance, outboxBalance;

  if (token.id === TokenType.ETH) {
    [fulfillerBalance, outboxBalance] = otherResults;
  } else {
    const [fulfillerResult, outboxResult] = otherMulticallResults;
    fulfillerBalance = fulfillerResult.result;
    outboxBalance = outboxResult.result;
  }

  return {
    account: +formatEther(accountResult.result),
    fulfiller: +formatEther(fulfillerBalance),
    outbox: +formatEther(outboxBalance),
    paymaster: +formatEther(paymasterResult.result),
    entryPoint: +formatEther(entryPointResult.result),
  };
}
