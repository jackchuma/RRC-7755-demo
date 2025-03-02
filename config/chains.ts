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
      paymaster: "0x69df334e6198505cf8a7148ef1e391b236027aee",
      inbox: "0xbd8aa533a5bc196d7438794cbe1679c193d13292",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0xce8b068D4F7F2eb3bDAFa72eC3C4feE78CF9Ccf7",
      outboxContracts: {
        Hashi: "0xbee220476c330f342cd1832dcefd81d892705b23",
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
      paymaster: "0x55569cf8cad072c0a07ad8dc9f20028fd841f9f7",
      inbox: "0xa8104b5e560d6daed6e0f9bd2bbebf824a0f7aac",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x6602dc9b6bd964C2a11BBdA9B2275308D1Bbc14f",
      outboxContracts: {
        Arbitrum: "0x1a407287aa69664e59481b92860c29af8ebbf3ba",
        OPStack: "0x73211c8f1f891a52b665d4606bee27525ecfaef3",
        Hashi: "0x1841324612d8a8e017dcc9917e04f90f42fda3f0",
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
      paymaster: "0x30adfdab722d36b26f12f562d7cadf4cd8831c58",
      inbox: "0x2504b1c3b78b2711e24eadf7ea077b0ca1b91859",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x7237bb8d1d38DF8b473b5A38eD90088AF162ad8e",
      outboxContracts: {
        Arbitrum: "0x2b77db0e0626fb6ce0c9def53139d996efa0527d",
        OPStack: "0xe94fb72454ae2997ead677c891196efd6b830435",
        Hashi: "0x1bb8dacba30b1cd82ce1d3d7f24e16ee549aebe8",
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
