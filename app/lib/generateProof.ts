"use server";

import AnchorStateRegistry from "@/abis/AnchorStateRegistry";
import ArbitrumRollup from "@/abis/ArbitrumRollup";
import chains from "@/config/chains";
import {
  anchorStateRegistrySlot,
  fulfillmentInfoSlot,
} from "@/utils/constants";
import safeFetch from "@/utils/safeFetch";
import { ChainConfig } from "@/utils/types/chainConfig";
import {
  ArbitrumProofType,
  Assertion,
  HashiProofType,
  OPStackProofType,
  ProofType as StorageProofType,
} from "@/utils/types/proof";
import {
  Address,
  Block,
  bytesToHex,
  decodeEventLog,
  encodeAbiParameters,
  GetProofReturnType,
  Hex,
  keccak256,
  Log,
  toHex,
  toRlp,
} from "viem";
import { arbitrumSepolia, baseSepolia, optimismSepolia } from "viem/chains";
const { ssz } = await import("@lodestar/types");
const { SignedBeaconBlock, BeaconBlock } = ssz.deneb;
const { createProof, ProofType } = await import(
  "@chainsafe/persistent-merkle-tree"
);

export type GenerateProofResponse = {
  success: boolean;
  data: { proof: StorageProofType };
};

export type GetBeaconRootAndL2TimestampReturnType = {
  beaconRoot: Hex;
  timestampForL2BeaconOracle: bigint;
};
export type StateRootProofReturnType = { proof: Hex[]; leaf: Hex };
export type L2Block = Block & { parentBeaconBlockRoot: Hex; number: bigint };
export type DecodedNodeCreatedLog = {
  args: {
    parentAssertionHash: Hex;
    assertion: { afterState: Assertion };
    afterInboxBatchAcc: Hex;
  };
};
export type GetStorageProofsInput = {
  l1BlockNumber?: bigint;
  l2Block: Block;
  l2Slot: Address;
  parentAssertionHash?: Hex;
  afterInboxBatchAcc?: Hex;
  assertion?: Assertion;
  l1Chain: ChainConfig;
  dstChain: ChainConfig;
  usingHashi: boolean;
};
export type Proofs = {
  storageProof?: GetProofReturnType;
  l2StorageProof: GetProofReturnType;
  l2MessagePasserStorageProof?: GetProofReturnType;
};

export async function generateProof(
  srcChainId: number,
  l1ChainId: number,
  dstChainId: number,
  requestHash: Hex,
  timestampCutoff: number
): Promise<GenerateProofResponse> {
  const srcChain = chains[srcChainId];
  const l1Chain = chains[l1ChainId];
  const dstChain = chains[dstChainId];

  let beaconData: GetBeaconRootAndL2TimestampReturnType | undefined;
  let l1BlockNumber: bigint | undefined;
  let stateRootInclusion: StateRootProofReturnType | undefined;

  const isUsingHashi = true; // defaulting to true for this demo so we don't have to wait for the destination chain's state finality
  // const isUsingHashi = !srcChain.exposesL1State || !dstChain.sharesStateWithL1;

  if (!isUsingHashi) {
    beaconData = await getBeaconRootAndL2Timestamp(srcChain);
    const beaconBlock = await getBeaconBlock(beaconData.beaconRoot);
    stateRootInclusion = getExecutionStateRootProof(beaconBlock);
    l1BlockNumber = BigInt(beaconBlock.body.executionPayload.blockNumber);
  }

  const { l2Block, parentAssertionHash, afterInboxBatchAcc, assertion } =
    await getL2Block(dstChain, isUsingHashi, l1Chain, l1BlockNumber);
  const l2Slot = deriveRRC7755VerifierStorageSlot(requestHash);

  if (timestampCutoff > l2Block.timestamp) {
    throw new Error("L2 block timestamp is too old");
  }

  const storageProofOpts = {
    l1BlockNumber,
    l2Block,
    l2Slot,
    parentAssertionHash,
    afterInboxBatchAcc,
    assertion,
    l1Chain,
    dstChain,
    usingHashi: isUsingHashi,
  };
  const storageProofs = await getStorageProofs(storageProofOpts);

  const proof = storeProofObj(
    isUsingHashi,
    dstChain,
    storageProofs,
    l2Block,
    beaconData,
    stateRootInclusion,
    assertion,
    parentAssertionHash,
    afterInboxBatchAcc
  );

  return { success: true, data: { proof } };
}

async function getBeaconRootAndL2Timestamp(
  srcChain: ChainConfig
): Promise<GetBeaconRootAndL2TimestampReturnType> {
  console.log("getBeaconRootAndL2Timestamp");
  const block: L2Block = await srcChain.publicClient.getBlock();

  return {
    beaconRoot: block.parentBeaconBlockRoot,
    timestampForL2BeaconOracle: block.timestamp,
  };
}

async function getBeaconBlock(tag: string): Promise<any> {
  console.log("getBeaconBlock");
  const beaconApiUrl = process.env.NODE;
  const url = `${beaconApiUrl}/eth/v2/beacon/blocks/${tag}`;
  const req = { headers: { Accept: "application/octet-stream" } };
  const resp = await safeFetch(url, req);

  if (!resp) {
    throw new Error("Error fetching Beacon Block");
  }

  if (resp.status === 404) {
    throw new Error(`Missing block ${tag}`);
  }

  if (resp.status !== 200) {
    throw new Error(`error fetching block ${tag}: ${await resp.text()}`);
  }

  const raw = new Uint8Array(await resp.arrayBuffer());
  const signedBlock = SignedBeaconBlock.deserialize(raw);
  return signedBlock.message;
}

function getExecutionStateRootProof(block: any): StateRootProofReturnType {
  console.log("getExecutionStateRootProof");
  const blockView = BeaconBlock.toView(block);
  const path = ["body", "executionPayload", "stateRoot"];
  const pathInfo = blockView.type.getPathInfo(path);
  const proofObj = createProof(blockView.node, {
    type: ProofType.single,
    gindex: pathInfo.gindex,
  }) as any;
  const proof = proofObj.witnesses.map((w: Uint8Array) => bytesToHex(w));
  const leaf = bytesToHex(proofObj.leaf as Uint8Array);
  return { proof, leaf };
}

async function getL2Block(
  dstChain: ChainConfig,
  usingHashi: boolean,
  l1Chain: ChainConfig,
  blockNumber?: bigint
): Promise<{
  l2Block: Block;
  parentAssertionHash?: Hex;
  afterInboxBatchAcc?: Hex;
  assertion?: Assertion;
}> {
  console.log("getL2Block");

  if (usingHashi) {
    // NOTE: This is only for a proof of concept. We have a mock shoyu bashi contract that allows us to directly set the block hash for the l2 block number.
    // In production, more sophisticated logic will be needed to determine the latest block number accounted for in the Hashi system.
    return { l2Block: await dstChain.publicClient.getBlock() };
  }

  switch (dstChain.chainId) {
    case arbitrumSepolia.id:
      return await getArbitrumSepoliaBlock(l1Chain, dstChain, blockNumber);
    case baseSepolia.id:
    case optimismSepolia.id:
      return await getOptimismSepoliaBlock(dstChain, l1Chain, blockNumber);
    default:
      throw new Error("Received unknown chain in getL2Block");
  }
}

async function getArbitrumSepoliaBlock(
  l1Chain: ChainConfig,
  dstChain: ChainConfig,
  l1BlockNumber?: bigint
): Promise<{
  l2Block: Block;
  parentAssertionHash: Hex;
  afterInboxBatchAcc: Hex;
  assertion: Assertion;
}> {
  console.log("getArbitrumSepoliaBlock");

  if (!l1BlockNumber) {
    throw new Error("Block number is required");
  }

  // Need to get blockHash instead
  // 1. Get latest node from Rollup contract
  const assertionHash: Hex = await l1Chain.publicClient.readContract({
    address: dstChain.l2Oracle,
    abi: ArbitrumRollup,
    functionName: "latestConfirmed",
    blockNumber: l1BlockNumber,
  });

  // 2. Query event from latest node creation
  const logs = await getLogs(assertionHash, dstChain);
  if (logs.length === 0) {
    throw new Error("Error finding Arb Rollup Log");
  }
  const topics = decodeEventLog({
    abi: ArbitrumRollup,
    data: logs[0].data,
    topics: logs[0].topics,
  }) as unknown as DecodedNodeCreatedLog;

  if (!topics.args) {
    throw new Error("Error decoding NodeCreated log");
  }
  if (!topics.args.assertion) {
    throw new Error("Error: assertion field not found in decoded log");
  }

  // 3. Grab assertion from Node event
  const { parentAssertionHash, assertion, afterInboxBatchAcc } = topics.args;

  // 4. Parse blockHash from assertion
  const blockHash = assertion.afterState.globalState.bytes32Vals[0];
  const l2Block = await dstChain.publicClient.getBlock({
    blockHash,
  });

  return {
    l2Block,
    parentAssertionHash,
    afterInboxBatchAcc,
    assertion: assertion.afterState,
  };
}

async function getLogs(
  assertionHash: Address,
  dstChain: ChainConfig
): Promise<Log[]> {
  const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
  const url = `https://api-sepolia.etherscan.io/api?module=logs&action=getLogs&address=${dstChain.l2Oracle}&topic0=0x901c3aee23cf4478825462caaab375c606ab83516060388344f0650340753630&topic0_1_opr=and&topic1=${assertionHash}&page=1&apikey=${etherscanApiKey}`;
  return await request(url);
}

async function request(url: string): Promise<any> {
  const res = await safeFetch(url);

  if (res === null || !res.ok) {
    throw new Error("Error fetching logs from etherscan");
  }

  const json = await res.json();

  return json.result;
}

async function getOptimismSepoliaBlock(
  dstChain: ChainConfig,
  l1Chain: ChainConfig,
  blockNumber?: bigint
): Promise<{ l2Block: Block }> {
  const l2BlockNumber = await getL2BlockNumber(dstChain, l1Chain, blockNumber);
  const l2Block = await dstChain.publicClient.getBlock({
    blockNumber: l2BlockNumber,
  });
  return { l2Block };
}

async function getL2BlockNumber(
  dstChain: ChainConfig,
  l1Chain: ChainConfig,
  l1BlockNumber?: bigint
): Promise<bigint> {
  if (!l1BlockNumber) {
    throw new Error("Block number is required");
  }

  const [, l2BlockNumber]: [any, bigint] =
    await l1Chain.publicClient.readContract({
      address: dstChain.l2Oracle,
      abi: AnchorStateRegistry,
      functionName: "anchors",
      args: [0n],
      blockNumber: l1BlockNumber,
    });
  return l2BlockNumber;
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
  const { l1BlockNumber, l2Block, l2Slot, l1Chain, dstChain, usingHashi } =
    opts;

  const calls = [
    dstChain.publicClient.getProof({
      address: dstChain.contracts.inbox,
      storageKeys: [l2Slot],
      blockNumber: l2Block.number,
    }),
  ];

  if (!usingHashi) {
    if (!l1BlockNumber) {
      throw new Error("L1 block number is required for non-Hashi proofs");
    }

    calls.push(
      l1Chain.publicClient.getProof(buildL1Proof(opts, l1BlockNumber))
    );

    if (dstChain.chainId === optimismSepolia.id) {
      calls.push(
        dstChain.publicClient.getProof({
          address: dstChain.contracts.l2MessagePasser,
          storageKeys: [],
          blockNumber: l2Block.number,
        })
      );
    }
  }

  const storageProofs = await Promise.all(calls);

  const [l2StorageProof, storageProof, l2MessagePasserStorageProof] =
    storageProofs;
  return { storageProof, l2StorageProof, l2MessagePasserStorageProof };
}

function buildL1Proof(
  opts: GetStorageProofsInput,
  l1BlockNumber: bigint
): { address: Address; storageKeys: Address[]; blockNumber: bigint } {
  const address = opts.dstChain.l2Oracle;
  let storageKeys = [anchorStateRegistrySlot];
  const { parentAssertionHash, assertion, afterInboxBatchAcc } = opts;

  if (opts.dstChain.chainId === arbitrumSepolia.id) {
    if (!parentAssertionHash) {
      throw new Error("Parent assertion hash is required for Arbitrum proofs");
    }
    if (!assertion) {
      throw new Error("Assertion is required for Arbitrum proofs");
    }
    if (!afterInboxBatchAcc) {
      throw new Error("After inbox batch acc is required for Arbitrum proofs");
    }

    const afterStateHash = keccak256(
      encodeAbiParameters(
        [
          {
            components: [
              {
                components: [
                  {
                    internalType: "bytes32[2]",
                    name: "bytes32Vals",
                    type: "bytes32[2]",
                  },
                  {
                    internalType: "uint64[2]",
                    name: "u64Vals",
                    type: "uint64[2]",
                  },
                ],
                internalType: "struct GlobalState",
                name: "globalState",
                type: "tuple",
              },
              {
                internalType: "enum MachineStatus",
                name: "machineStatus",
                type: "uint8",
              },
              {
                internalType: "bytes32",
                name: "endHistoryRoot",
                type: "bytes32",
              },
            ],
            internalType: "struct AssertionState",
            name: "beforeState",
            type: "tuple",
          },
        ],
        [assertion]
      )
    );
    const newAssertionHash = keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "bytes32" }, { type: "bytes32" }],
        [parentAssertionHash, afterStateHash, afterInboxBatchAcc]
      )
    );
    const slot = 117n;
    const derivedSlot = keccak256(
      encodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint256" }],
        [newAssertionHash, slot]
      )
    );
    storageKeys = [derivedSlot];
  }

  return { address, storageKeys, blockNumber: l1BlockNumber };
}

function storeProofObj(
  usingHashi: boolean,
  dstChain: ChainConfig,
  proofs: Proofs,
  l2Block: Block,
  beaconData?: GetBeaconRootAndL2TimestampReturnType,
  stateRootInclusion?: StateRootProofReturnType,
  assertion?: Assertion,
  parentAssertionHash?: Hex,
  afterInboxBatchAcc?: Hex
): StorageProofType {
  console.log("storeProofObj");

  if (usingHashi) {
    return buildHashiProof(proofs, l2Block);
  }

  if (!beaconData) {
    throw new Error("Beacon data is required for non-Hashi proofs");
  }
  if (!stateRootInclusion) {
    throw new Error("State root inclusion is required for non-Hashi proofs");
  }

  switch (dstChain.chainId) {
    case arbitrumSepolia.id:
      if (!assertion) {
        throw new Error("Assertion is required for Arbitrum proofs");
      }
      if (!parentAssertionHash) {
        throw new Error(
          "Parent assertion hash is required for Arbitrum proofs"
        );
      }
      if (!afterInboxBatchAcc) {
        throw new Error(
          "After inbox batch acc is required for Arbitrum proofs"
        );
      }
      return buildArbitrumProof(
        proofs,
        l2Block,
        beaconData,
        stateRootInclusion,
        assertion,
        parentAssertionHash,
        afterInboxBatchAcc
      );
    case optimismSepolia.id:
      return buildOPStackProof(proofs, l2Block, beaconData, stateRootInclusion);
    default:
      throw new Error("Unsupported chain");
  }
}

function buildHashiProof(proofs: Proofs, l2Block: Block): HashiProofType {
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

function getEncodedBlockArray(l2Block: Block): Hex {
  const blockArray = buildBlockArray(l2Block);
  const encodedBlockArray = toRlp(blockArray);

  if (keccak256(encodedBlockArray) !== l2Block.hash) {
    throw new Error("Blockhash mismatch");
  }

  return encodedBlockArray;
}

function buildBlockArray(l2Block: any): Hex[] {
  const blockArray = [
    l2Block.parentHash,
    l2Block.sha3Uncles,
    l2Block.miner,
    l2Block.stateRoot,
    l2Block.transactionsRoot,
    l2Block.receiptsRoot,
    l2Block.logsBloom,
    l2Block.difficulty !== 0n ? toHex(l2Block.difficulty) : "",
    l2Block.number !== 0n ? toHex(l2Block.number) : "",
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
    blockArray.push(tmp1 ? toHex(l2Block.baseFeePerGas) : "");
  }

  if (tmp2 || tmp3 || tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp2 ? l2Block.withdrawalsRoot : "");
  }

  if (tmp3 || tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp3 ? toHex(l2Block.blobGasUsed) : "");
  }

  if (tmp4 || tmp5 || tmp6) {
    blockArray.push(tmp4 ? toHex(l2Block.excessBlobGas) : "");
  }

  if (tmp5 || tmp6) {
    blockArray.push(tmp5 ? l2Block.parentBeaconBlockRoot : "");
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

function buildArbitrumProof(
  proofs: Proofs,
  l2Block: Block,
  beaconData: GetBeaconRootAndL2TimestampReturnType,
  stateRootInclusion: StateRootProofReturnType,
  assertion: Assertion,
  parentAssertionHash: Hex,
  afterInboxBatchAcc: Hex
): ArbitrumProofType {
  if (!proofs.storageProof) {
    throw new Error("Storage proof is required for Arbitrum proofs");
  }

  if (proofs.storageProof.storageProof[0].value === 0n) {
    throw new Error("Storage proof value is 0");
  }
  if (proofs.l2StorageProof.storageProof[0].value === 0n) {
    throw new Error("L2 storage proof value is 0");
  }

  return {
    stateProofParams: {
      beaconRoot: beaconData.beaconRoot,
      beaconOracleTimestamp: beaconData.timestampForL2BeaconOracle,
      executionStateRoot: stateRootInclusion.leaf,
      stateRootProof: stateRootInclusion.proof,
    },
    dstL2StateRootProofParams: {
      storageKey: proofs.storageProof.storageProof[0].key,
      storageValue: convertToHex(proofs.storageProof.storageProof[0].value),
      accountProof: proofs.storageProof.accountProof,
      storageProof: proofs.storageProof.storageProof[0].proof,
    },
    dstL2AccountProofParams: {
      storageKey: proofs.l2StorageProof.storageProof[0].key,
      storageValue: convertToHex(proofs.l2StorageProof.storageProof[0].value),
      accountProof: proofs.l2StorageProof.accountProof,
      storageProof: proofs.l2StorageProof.storageProof[0].proof,
    },
    encodedBlockArray: getEncodedBlockArray(l2Block),
    afterState: assertion,
    prevAssertionHash: parentAssertionHash,
    sequencerBatchAcc: afterInboxBatchAcc,
  };
}

function buildOPStackProof(
  proofs: Proofs,
  l2Block: Block,
  beaconData: GetBeaconRootAndL2TimestampReturnType,
  stateRootInclusion: StateRootProofReturnType
): OPStackProofType {
  if (!proofs.l2MessagePasserStorageProof) {
    throw new Error(
      "L2 message passer storage proof is required for OPStack proofs"
    );
  }
  if (!proofs.storageProof) {
    throw new Error("Storage proof is required for OPStack proofs");
  }
  if (proofs.storageProof.storageProof[0].value === 0n) {
    throw new Error("Storage proof value is 0");
  }
  if (proofs.l2StorageProof.storageProof[0].value === 0n) {
    throw new Error("L2 storage proof value is 0");
  }

  return {
    l2MessagePasserStorageRoot: proofs.l2MessagePasserStorageProof.storageHash,
    encodedBlockArray: getEncodedBlockArray(l2Block),
    stateProofParams: {
      beaconRoot: beaconData.beaconRoot,
      beaconOracleTimestamp: beaconData.timestampForL2BeaconOracle,
      executionStateRoot: stateRootInclusion.leaf,
      stateRootProof: stateRootInclusion.proof,
    },
    dstL2StateRootProofParams: {
      storageKey: proofs.storageProof.storageProof[0].key,
      storageValue: convertToHex(proofs.storageProof.storageProof[0].value),
      accountProof: proofs.storageProof.accountProof,
      storageProof: proofs.storageProof.storageProof[0].proof,
    },
    dstL2AccountProofParams: {
      storageKey: proofs.l2StorageProof.storageProof[0].key,
      storageValue: convertToHex(proofs.l2StorageProof.storageProof[0].value),
      accountProof: proofs.l2StorageProof.accountProof,
      storageProof: proofs.l2StorageProof.storageProof[0].proof,
    },
  };
}
