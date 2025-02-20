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
      inbox: "0x1bb8dacba30b1cd82ce1d3d7f24e16ee549aebe8",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0xce8b068D4F7F2eb3bDAFa72eC3C4feE78CF9Ccf7",
      outboxContracts: {
        Hashi: "0x37ce91ee91ea28b1e704fda056e791f062cad44d",
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
      inbox: "0x30adfdab722d36b26f12f562d7cadf4cd8831c58",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x6602dc9b6bd964C2a11BBdA9B2275308D1Bbc14f",
      outboxContracts: {
        Arbitrum: "0x2504b1c3b78b2711e24eadf7ea077b0ca1b91859",
        OPStack: "0x57ee7e881f108fbc8dcc9216b1329d0929fe2c32",
        Hashi: "0x2b77db0e0626fb6ce0c9def53139d996efa0527d",
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
      inbox: "0x75319530c71ee1a9ef9bd477766d82d7b2c4f068",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x7237bb8d1d38DF8b473b5A38eD90088AF162ad8e",
      outboxContracts: {
        Arbitrum: "0x4b249e565c6d12a48a6946faffc4bba0b82f6487",
        OPStack: "0x0af2dad45c60097115724bb3826930f56848d317",
        Hashi: "0xf0c0b1cbfd50a2b7d72eb93a60ac1fd9311ea042",
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
