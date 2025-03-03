"use server";

import {
  Address,
  encodeAbiParameters,
  encodeFunctionData,
  encodePacked,
  Hex,
  parseEther,
  toHex,
  zeroAddress,
} from "viem";

import Outbox from "@/abis/Outbox";
import Calls from "@/abis/Calls";
import ERC20 from "@/abis/ERC20";
import PackedUserOperation from "@/abis/PackedUserOperation";
import { RequestType } from "@/utils/types/request";
import { Token, TokenType } from "@/utils/types/tokenType";
import { Provers } from "@/utils/types/chainConfig";
import EntryPoint from "@/abis/EntryPoint";
import MockAccount from "@/abis/MockAccount";
import addressToBytes32 from "@/utils/addressToBytes32";
import chains from "@/config/chains";
import Attributes from "@/utils/attributes";
import { nativeAssetAddress } from "@/utils/constants";
import { Call } from "@/utils/types/call";
import { calculateRewardAmount } from "@/utils/calculateRewardAmount";

export type BuildTransactionResponse = {
  success: boolean;
  data: { id: Hex; calls: Call[]; args: any };
};

export async function buildTransaction(
  sourceChainId: number,
  dstChainId: number,
  requestType: RequestType,
  to: Address,
  token: Token,
  amount: number
): Promise<BuildTransactionResponse> {
  console.log("Building transaction");
  const srcChain = chains[sourceChainId];
  const dstChain = chains[dstChainId];

  const needsHashi = true; // defaulting to true for this demo so we don't have to wait for the destination chain's state finality
  // const needsHashi = !srcChain.exposesL1State || !dstChain.sharesStateWithL1;
  let finalityDelay = 1; // seconds

  if (!needsHashi) {
    if (dstChainId === 421614) {
      finalityDelay = 3600; // 1 hour
    } else {
      finalityDelay = 604_800; // 1 week
    }
  }

  const outboxName = needsHashi ? Provers.Hashi : dstChain.targetProver;

  const dstChainIdBytes32 = toHex(dstChainId, { size: 32 });
  const receiver =
    requestType === RequestType.Standard
      ? dstChain.contracts.inbox
      : dstChain.contracts.entryPoint;
  const { attributes, value } = await buildAttributes(
    needsHashi,
    token,
    amount,
    finalityDelay,
    to,
    dstChain.l2Oracle,
    srcChain.contracts.shoyuBashi,
    sourceChainId,
    dstChainId,
    outboxName,
    requestType
  );
  const payload = await buildPayload(
    requestType,
    token,
    amount,
    to,
    dstChain.contracts.paymaster,
    attributes,
    dstChainId
  );

  const address = srcChain.contracts.outboxContracts[outboxName];
  const args: any = [
    dstChainIdBytes32,
    addressToBytes32(receiver),
    payload,
    requestType === RequestType.Standard ? attributes : [],
  ];

  const id = await srcChain.publicClient.readContract({
    address,
    abi: Outbox,
    functionName: "getRequestId",
    args: [
      toHex(sourceChainId, { size: 32 }),
      addressToBytes32(address),
      dstChainIdBytes32,
      addressToBytes32(receiver),
      payload,
      requestType === RequestType.Standard ? attributes : [],
    ],
  });

  const calls: Call[] = [
    {
      to: address as Hex,
      data: encodeFunctionData({
        abi: Outbox,
        functionName: "sendMessage",
        args,
      }),
      value: token.id === TokenType.ETH ? value : BigInt(0),
    },
  ];

  return { success: true, data: { id, calls, args } };
}

async function buildPayload(
  requestType: RequestType,
  token: Token,
  amount: number,
  to: Address,
  paymaster: Address,
  attributes: Hex[],
  dstChainId: number
): Promise<Hex> {
  console.log("Building payload");
  if (requestType === RequestType.Standard) {
    let callDst = token.address;
    let data = encodeFunctionData({
      abi: ERC20,
      functionName: "transfer",
      args: [to, parseEther(amount.toString())],
    });
    let value = BigInt(0);

    if (token.id === TokenType.ETH) {
      callDst = to;
      data = "0x" as Hex;
      value = parseEther(amount.toString());
    }

    const calls = [{ to: addressToBytes32(callDst), data, value }];
    return encodeAbiParameters(Calls, [calls]);
  }

  return await buildUserOp(
    chains[dstChainId].contracts.smartAccount,
    paymaster,
    attributes,
    amount,
    dstChainId,
    token.address
  );
}

async function buildAttributes(
  needsHashi: boolean,
  token: Token,
  amount: number,
  finalityDelay: number,
  requester: Address,
  l2Oracle: Address,
  shoyuBashi: Address,
  srcChainId: number,
  dstChainId: number,
  outbox: string,
  requestType: RequestType
): Promise<{ attributes: Hex[]; value: bigint }> {
  console.log("Building attributes");
  const attributes = new Attributes();

  // reward
  const asset = token.address;
  const rewardAmount = calculateRewardAmount(amount);
  const value = parseEther(rewardAmount.toString());
  attributes.addReward(addressToBytes32(asset), value);

  // delay
  attributes.addDelay(finalityDelay, Math.floor(Date.now() / 1000) + 1_209_600); // 2 weeks to expiry

  // nonce
  const nonce = await getUserNonce(requester, srcChainId, outbox);
  attributes.addNonce(nonce + 1);

  // requester
  attributes.addRequester(requester);

  if (needsHashi) {
    // shoyuBashi
    attributes.addShoyuBashi(shoyuBashi);

    // destinationChainId
    attributes.addDestinationChainId(dstChainId);
  } else {
    // l2Oracle
    attributes.addL2Oracle(l2Oracle);
  }

  if (requestType === RequestType.SmartAccount) {
    attributes.addInbox(chains[dstChainId].contracts.inbox);
  }

  attributes.addMagicSpendRequest(token.address, parseEther(amount.toString()));

  return { attributes: attributes.list(), value };
}

async function buildUserOp(
  smartAccount: Address,
  paymaster: Address,
  attributes: Hex[],
  amount: number,
  dstChainId: number,
  token: Address
): Promise<Hex> {
  console.log("Building user op");
  const verificationGasLimit = BigInt(100_000);
  const callGasLimit = BigInt(100_000);
  const maxPriorityFeePerGas = BigInt(100_000);
  const maxFeePerGas = BigInt(100_000);

  const nonce = await getEntryPointNonce(smartAccount, dstChainId);

  const userOp = {
    sender: smartAccount,
    nonce,
    initCode: "0x" as Hex,
    callData: encodeFunctionData({
      abi: MockAccount,
      functionName: "executeUserOp",
      args: [paymaster, addressToBytes32(token)],
    }),
    accountGasLimits: encodePacked(
      ["uint128", "uint128"],
      [verificationGasLimit, callGasLimit]
    ),
    preVerificationGas: BigInt(100_000),
    gasFees: encodePacked(
      ["uint128", "uint128"],
      [maxPriorityFeePerGas, maxFeePerGas]
    ),
    paymasterAndData: encodePaymasterAndData(
      paymaster,
      attributes,
      amount,
      token
    ),
    signature: "0x" as Hex,
  };
  return encodeAbiParameters(PackedUserOperation, [userOp]);
}

function encodePaymasterAndData(
  paymaster: Address,
  attributes: Hex[],
  amount: number,
  token: Address
): Hex {
  console.log("Encoding paymaster and data");
  const precheck = zeroAddress;
  const paymasterVerificationGasLimit = BigInt(100_000);
  const paymasterPostOpGasLimit = BigInt(100_000);
  return encodePacked(
    ["address", "uint128", "uint128", "bytes"],
    [
      paymaster,
      paymasterVerificationGasLimit,
      paymasterPostOpGasLimit,
      encodeAbiParameters(
        [
          { type: "address" },
          { type: "uint256" },
          { type: "address" },
          { type: "bytes[]" },
        ],
        [token, parseEther(amount.toString()), precheck, attributes]
      ),
    ]
  );
}

async function getUserNonce(
  account: Address,
  chainId: number,
  outbox: string
): Promise<number> {
  console.log("Getting user nonce");
  const chain = chains[chainId];

  if (!chain) {
    throw new Error("Chain not found");
  }

  const client = chain.publicClient;

  const nonce = await client.readContract({
    address: chain.contracts.outboxContracts[outbox],
    abi: Outbox,
    functionName: "getNonce",
    args: [account],
  });

  return Number(nonce);
}

async function getEntryPointNonce(
  account: Address,
  chainId: number
): Promise<bigint> {
  console.log("Getting entry point nonce");
  const chain = chains[chainId];

  if (!chain) {
    throw new Error("Chain not found");
  }

  const client = chain.publicClient;

  return await client.readContract({
    address: chain.contracts.entryPoint,
    abi: EntryPoint,
    functionName: "getNonce",
    args: [account, 0],
  });
}
