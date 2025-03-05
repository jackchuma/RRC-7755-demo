import type { Hex } from "viem";

export type AccountProofParams = {
  storageKey: Hex;
  storageValue: Hex;
  accountProof: Hex[];
  storageProof: Hex[];
};

export type HashiProofType = {
  rlpEncodedBlockHeader: Hex;
  dstAccountProofParams: AccountProofParams;
};

export type ProofType = HashiProofType;
