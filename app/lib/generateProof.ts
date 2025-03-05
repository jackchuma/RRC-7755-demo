"use server";

import chains from "@/config/chains";
import { fulfillmentInfoSlot } from "@/utils/constants";
import { ChainConfig } from "@/utils/types/chainConfig";
import {
  HashiProofType,
  ProofType as StorageProofType,
} from "@/utils/types/proof";
import {
  Address,
  Block,
  encodeAbiParameters,
  GetProofReturnType,
  Hex,
  keccak256,
  toHex,
  toRlp,
} from "viem";

export type GenerateProofResponse = {
  success: boolean;
  data: { proof: StorageProofType };
};

export type L2Block = Block & {
  parentBeaconBlockRoot: Hex;
  number: bigint;
  requestsRoot: Hex;
  baseFeePerGas: bigint;
  withdrawalsRoot: Hex;
  logsBloom: Hex;
  nonce: Hex;
};
export type GetStorageProofsInput = {
  l2Block: L2Block;
  l2Slot: Address;
  dstChain: ChainConfig;
};
export type Proofs = {
  storageProof?: GetProofReturnType;
  l2StorageProof: GetProofReturnType;
  l2MessagePasserStorageProof?: GetProofReturnType;
};

export async function generateProof(
  dstChainId: number,
  requestHash: Hex,
  timestampCutoff: number
): Promise<GenerateProofResponse> {
  const dstChain = chains[dstChainId];

  const isUsingHashi = true; // defaulting to true for this demo so we don't have to wait for the destination chain's state finality
  // const isUsingHashi = !srcChain.exposesL1State || !dstChain.sharesStateWithL1;

  const l2Block = await getL2Block(dstChain, isUsingHashi);
  const l2Slot = deriveRRC7755VerifierStorageSlot(requestHash);

  if (timestampCutoff > l2Block.timestamp) {
    throw new Error("L2 block timestamp is too old");
  }

  const storageProofOpts = {
    l2Block,
    l2Slot,
    dstChain,
  };
  const storageProofs = await getStorageProofs(storageProofOpts);
  const proof = storeProofObj(isUsingHashi, storageProofs, l2Block);

  return { success: true, data: { proof } };
}

async function getL2Block(
  dstChain: ChainConfig,
  usingHashi: boolean
): Promise<L2Block> {
  console.log("getL2Block");

  if (usingHashi) {
    // NOTE: This is only for a proof of concept. We have a mock shoyu bashi contract that allows us to directly set the block hash for the l2 block number.
    // In production, more sophisticated logic will be needed to determine the latest block number accounted for in the Hashi system.
    return (await dstChain.publicClient.getBlock()) as unknown as L2Block;
  }

  throw new Error("Only Hashi proofs are supported for this demo");
}

function deriveRRC7755VerifierStorageSlot(requestHash: Address): Address {
  console.log("deriveRRC7755VerifierStorageSlot");
  return keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint256" }],
      [requestHash, BigInt(fulfillmentInfoSlot)]
    )
  );
}

async function getStorageProofs(opts: GetStorageProofsInput): Promise<Proofs> {
  console.log("getStorageProofs");
  const { l2Block, l2Slot, dstChain } = opts;

  const calls = [
    dstChain.publicClient.getProof({
      address: dstChain.contracts.inbox,
      storageKeys: [l2Slot],
      blockNumber: l2Block.number,
    }),
  ];

  const storageProofs = await Promise.all(calls);

  const [l2StorageProof, storageProof, l2MessagePasserStorageProof] =
    storageProofs;
  return { storageProof, l2StorageProof, l2MessagePasserStorageProof };
}

function storeProofObj(
  usingHashi: boolean,
  proofs: Proofs,
  l2Block: L2Block
): StorageProofType {
  console.log("storeProofObj");

  if (usingHashi) {
    return buildHashiProof(proofs, l2Block);
  }

  throw new Error("Only Hashi proofs are supported for this demo");
}

function buildHashiProof(proofs: Proofs, l2Block: L2Block): HashiProofType {
  if (proofs.l2StorageProof.storageProof[0].value === 0n) {
    throw new Error("L2 storage proof value is 0");
  }

  return {
    rlpEncodedBlockHeader: getEncodedBlockArray(l2Block),
    dstAccountProofParams: {
      storageKey: proofs.l2StorageProof.storageProof[0].key,
      storageValue: convertToHex(proofs.l2StorageProof.storageProof[0].value),
      accountProof: proofs.l2StorageProof.accountProof,
      storageProof: proofs.l2StorageProof.storageProof[0].proof,
    },
  };
}

function getEncodedBlockArray(l2Block: L2Block): Hex {
  const blockArray = buildBlockArray(l2Block);
  const encodedBlockArray = toRlp(blockArray);

  if (keccak256(encodedBlockArray) !== l2Block.hash) {
    throw new Error("Blockhash mismatch");
  }

  return encodedBlockArray;
}

function buildBlockArray(l2Block: L2Block): Hex[] {
  const blockArray: Hex[] = [
    l2Block.parentHash,
    l2Block.sha3Uncles,
    l2Block.miner,
    l2Block.stateRoot,
    l2Block.transactionsRoot,
    l2Block.receiptsRoot,
    l2Block.logsBloom,
    l2Block.difficulty !== 0n ? toHex(l2Block.difficulty) : "0x",
    l2Block.number !== 0n ? toHex(l2Block.number) : "0x",
    toHex(l2Block.gasLimit),
    toHex(l2Block.gasUsed),
    toHex(l2Block.timestamp),
    l2Block.extraData,
    l2Block.mixHash,
    l2Block.nonce,
  ];
  const tmp1 = l2Block.baseFeePerGas && l2Block.baseFeePerGas !== 0n;
  const tmp2 = l2Block.withdrawalsRoot && l2Block.withdrawalsRoot !== "0x";
  const tmp3 = l2Block.blobGasUsed && l2Block.blobGasUsed !== 0n;
  const tmp4 = l2Block.excessBlobGas && l2Block.excessBlobGas !== 0n;
  const tmp5 =
    l2Block.parentBeaconBlockRoot && l2Block.parentBeaconBlockRoot !== "0x";
  const tmp6 = l2Block.requestsRoot && l2Block.requestsRoot !== "0x";

  if (tmp1 || tmp2 || tmp3 || tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp1 ? toHex(l2Block.baseFeePerGas) : "0x");
  }

  if (tmp2 || tmp3 || tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp2 ? l2Block.withdrawalsRoot : "0x");
  }

  if (tmp3 || tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp3 ? toHex(l2Block.blobGasUsed) : "0x");
  }

  if (tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp4 ? toHex(l2Block.excessBlobGas) : "0x");
  }

  if (tmp5 || tmp6) {
    blockArray.push(tmp5 ? l2Block.parentBeaconBlockRoot : "0x");
  }

  if (tmp6) {
    blockArray.push(l2Block.requestsRoot);
  }

  return blockArray;
}

function convertToHex(value: bigint): Hex {
  const tmp = toHex(value);

  if (tmp.length % 2 !== 0) {
    return ("0x0" + tmp.slice(2)) as Hex;
  }

  return tmp;
}
