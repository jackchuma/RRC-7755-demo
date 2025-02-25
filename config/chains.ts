import { createPublicClient, http } from "viem";
import { arbitrumSepolia, baseSepolia, optimismSepolia } from "viem/chains";
import { ChainConfig, Provers } from "../utils/types/chainConfig";

export default {
  // Arbitrum Sepolia
  421614: {
    chainId: 421614,
    rpcUrl: arbitrumSepolia.rpcUrls.default.http[0],
    l2Oracle: "0x042B2E6C5E99d4c521bd49beeD5E99651D9B0Cf4",
    l2OracleStorageKey:
      "0x0000000000000000000000000000000000000000000000000000000000000076",
    contracts: {
      inbox: "0x5c2c743c41d7bff2cb3c1b82edbbb79e5c225baf",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0xce8b068D4F7F2eb3bDAFa72eC3C4feE78CF9Ccf7",
      outboxContracts: {
        Hashi: "0xd6b350775dca2f45597bef27010c1a4ce75065c4",
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
      inbox: "0x248c18c76445ab8b042d31d7609fffec800a57ba",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x6602dc9b6bd964C2a11BBdA9B2275308D1Bbc14f",
      outboxContracts: {
        Arbitrum: "0x946ca00a551d7009019b7bbd65f4d94a48792b8a",
        OPStack: "0x9d052b05d093a466c5138c765b980aa1e8d65dd8",
        Hashi: "0xbb82b46c2c557861e044a28a666c00b042b82794",
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
      inbox: "0xe44231d6dcdeeddb5b781c4bb24d309b695d9119",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x7237bb8d1d38DF8b473b5A38eD90088AF162ad8e",
      outboxContracts: {
        Arbitrum: "0x0005f24b46b973067542ab17c313bd6f36b12a34",
        OPStack: "0xbc54b421f508f18b05e70fa7326ac9e7cb600058",
        Hashi: "0xd33467cb60a4c0c9f703fc5cfc3d4313d21c7a3c",
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
