import { createPublicClient, http } from "viem";
import { arbitrumSepolia, baseSepolia, optimismSepolia } from "viem/chains";
import { ChainConfig, Provers } from "./types/chainConfig";

export default {
  // Arbitrum Sepolia
  421614: {
    chainId: 421614,
    rpcUrl: arbitrumSepolia.rpcUrls.default.http[0],
    l2Oracle: "0x042B2E6C5E99d4c521bd49beeD5E99651D9B0Cf4",
    l2OracleStorageKey:
      "0x0000000000000000000000000000000000000000000000000000000000000076",
    contracts: {
      inbox: "0x7dd0f51c71da5243174fa829c8cf3385b06833b0",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0xce8b068D4F7F2eb3bDAFa72eC3C4feE78CF9Ccf7",
      outboxContracts: {
        Hashi: "0xcd32060e689795219a24df7fc938bd717c68969c",
      },
    },
    publicClient: createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    }),
    targetProver: Provers.Arbitrum,
    exposesL1State: false,
    sharesStateWithL1: true,
    etherscanApiKey: process.env.ARBISCAN_API_KEY,
    etherscanApiUrl: "https://api-sepolia.arbiscan.io",
  },
  // Base Sepolia
  84532: {
    chainId: 84532,
    rpcUrl: baseSepolia.rpcUrls.default.http[0],
    l2Oracle: "0x4C8BA32A5DAC2A720bb35CeDB51D6B067D104205",
    l2OracleStorageKey:
      "0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49",
    contracts: {
      inbox: "0xc3033cd187e4258e67d4718049b8f27c0d4fd7e0",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x6602dc9b6bd964C2a11BBdA9B2275308D1Bbc14f",
      outboxContracts: {
        Arbitrum: "0xcd32060e689795219a24df7fc938bd717c68969c",
        OPStack: "0xf78c269454c1f9a6dd4b387a0371a918a3e9d642",
        Hashi: "0xb4ac39aadc3130fef3f348ece8d033540df12089",
      },
    },
    publicClient: createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
    targetProver: Provers.OPStack,
    exposesL1State: true,
    sharesStateWithL1: true,
    etherscanApiKey: process.env.BASESCAN_API_KEY,
    etherscanApiUrl: "https://api-sepolia.basescan.org",
  },
  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    rpcUrl: optimismSepolia.rpcUrls.default.http[0],
    l2Oracle: "0x218CD9489199F321E1177b56385d333c5B598629",
    l2OracleStorageKey:
      "0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49",
    contracts: {
      l2MessagePasser: "0x4200000000000000000000000000000000000016",
      inbox: "0xf912c2ddaeebe38869fff2ed5edf73327c0a8e55",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x7237bb8d1d38DF8b473b5A38eD90088AF162ad8e",
      outboxContracts: {
        Arbitrum: "0xaf8e568f4e3105e1d8818b26dca57cd4bd753695",
        OPStack: "0x09f9e99d379a9963fe13814b31b90ba81bf9a74f",
        Hashi: "0xf7e040e5f46be3a7b5e6adf11d454f71ffa16228",
      },
    },
    publicClient: createPublicClient({
      chain: optimismSepolia,
      transport: http(),
    }),
    targetProver: Provers.OPStack,
    exposesL1State: true,
    sharesStateWithL1: true,
    etherscanApiKey: process.env.OPTIMISM_API_KEY,
    etherscanApiUrl: "https://api-sepolia-optimistic.etherscan.io",
  },
} as Record<number, ChainConfig>;
