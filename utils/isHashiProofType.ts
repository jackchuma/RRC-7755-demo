import { HashiProofType, ProofType } from "./types/proof";

export function isHashiProofType(proof: ProofType): proof is HashiProofType {
  return (proof as HashiProofType).rlpEncodedBlockHeader !== undefined;
}
