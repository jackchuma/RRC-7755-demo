import { createPublicClient, http } from "viem";
import { arbitrumSepolia, baseSepolia, optimismSepolia } from "viem/chains";
import { ChainConfig, Provers } from "../utils/types/chainConfig";

export default {
  // Arbitrum Sepolia
  421614: {
    chainId: arbitrumSepolia.id,
    l2Oracle: "0x042B2E6C5E99d4c521bd49beeD5E99651D9B0Cf4",
    l2OracleStorageKey:
      "0x0000000000000000000000000000000000000000000000000000000000000076",
    contracts: {
      paymaster: "0x85d1097805f1021a99a5cd9d7d0b23fbc8076365",
      inbox: "0x18039cc3211df351364d56edff127abeb50bdbe0",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0xce8b068D4F7F2eb3bDAFa72eC3C4feE78CF9Ccf7",
      smartAccount: "0x0AFD6E86309eDE7f89d6B9CADE1E5eC113899577",
      mockAccountTracker: "0x2CD13Cc33eA00AE065906e5D75c9ebB042c02Cc8",
      outboxContracts: {
        Hashi: "0x0db4a95368675b8ab0d25a564205df1ec9494ebf",
      },
    },
    publicClient: createPublicClient({
      chain: arbitrumSepolia,
      transport: http(),
    }),
    targetProver: Provers.Arbitrum,
    exposesL1State: false,
    sharesStateWithL1: true,
  },
  // Base Sepolia
  84532: {
    chainId: baseSepolia.id,
    l2Oracle: "0x4C8BA32A5DAC2A720bb35CeDB51D6B067D104205",
    l2OracleStorageKey:
      "0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49",
    contracts: {
      paymaster: "0x5fafc58be8c07d155176035c17a44f8ea1d7bf46",
      inbox: "0x9e433ca69c6760b49b2dea488efa671d43bbeb49",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x6602dc9b6bd964C2a11BBdA9B2275308D1Bbc14f",
      smartAccount: "0x0AFD6E86309eDE7f89d6B9CADE1E5eC113899577",
      mockAccountTracker: "0x2CD13Cc33eA00AE065906e5D75c9ebB042c02Cc8",
      outboxContracts: {
        Arbitrum: "0x900539218b3458915963685cfb99c1a62077239c",
        OPStack: "0x08448686a799403989cc36388de95cc05b049cf0",
        Hashi: "0x85d1097805f1021a99a5cd9d7d0b23fbc8076365",
      },
    },
    publicClient: createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
    targetProver: Provers.OPStack,
    exposesL1State: true,
    sharesStateWithL1: true,
  },
  // Optimism Sepolia
  11155420: {
    chainId: optimismSepolia.id,
    l2Oracle: "0x218CD9489199F321E1177b56385d333c5B598629",
    l2OracleStorageKey:
      "0xa6eef7e35abe7026729641147f7915573c7e97b47efa546f5f6e3230263bcb49",
    contracts: {
      l2MessagePasser: "0x4200000000000000000000000000000000000016",
      paymaster: "0x99b176b822b3d3ff9414a821386f343d929f47a3",
      inbox: "0x45593691657df351e8487f295b5b83f82966b6db",
      entryPoint: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
      shoyuBashi: "0x7237bb8d1d38DF8b473b5A38eD90088AF162ad8e",
      smartAccount: "0x0AFD6E86309eDE7f89d6B9CADE1E5eC113899577",
      mockAccountTracker: "0x2CD13Cc33eA00AE065906e5D75c9ebB042c02Cc8",
      outboxContracts: {
        Arbitrum: "0x3179470e16cd6514b3bd4df246cf08d70e87ea70",
        OPStack: "0xbbe8887743df87db43626df0733503779c5a330d",
        Hashi: "0xd5a94d517381edb474d74673a8d0b024d8bf0fae",
      },
    },
    publicClient: createPublicClient({
      chain: optimismSepolia,
      transport: http(),
    }),
    targetProver: Provers.OPStack,
    exposesL1State: true,
    sharesStateWithL1: true,
  },
} as Record<number, ChainConfig>;
