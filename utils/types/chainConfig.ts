import { Address } from "viem";

export enum Provers {
  Arbitrum = "Arbitrum",
  OPStack = "OPStack",
  Hashi = "Hashi",
}

type Contracts = {
  l2MessagePasser?: Address;
  paymaster: Address;
  inbox: Address;
  entryPoint: Address;
  shoyuBashi: Address;
  smartAccount: Address;
  outboxContracts: Record<string, Address>;
};

export type ChainConfig = {
  chainId: number;
  l2Oracle: Address;
  l2OracleStorageKey: Address;
  publicClient: any;
  contracts: Contracts;
  targetProver: Provers;
  exposesL1State: boolean;
  sharesStateWithL1: boolean;
};
