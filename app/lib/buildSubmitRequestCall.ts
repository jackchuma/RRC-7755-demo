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
import PackedUserOperation from "@/abis/PackedUserOperation";
import { RequestType } from "@/utils/types/request";
import { Token, TokenType } from "@/utils/types/tokenType";
import { Provers } from "@/utils/types/chainConfig";
import EntryPoint from "@/abis/EntryPoint";
import MockAccount from "@/abis/MockAccount";
import addressToBytes32 from "@/utils/addressToBytes32";
import chains from "@/config/chains";
import Attributes from "@/utils/attributes";
import { Call } from "@/utils/types/call";
import { calculateRewardAmount } from "@/utils/calculateRewardAmount";
import MockAccountTracker from "@/abis/MockAccountTracker";
import MockToken from "@/abis/MockToken";

type Args = readonly [
  `0x${string}`,
  `0x${string}`,
  `0x${string}`,
  readonly `0x${string}`[]
];

export type BuildSubmitRequestCallResponse = {
  success: boolean;
  data: { id: Hex; calls: Call[]; args: Args; sender: Hex };
};

type OnchainCall = {
  to: Address;
  data: Hex;
  value: bigint;
};

export async function buildSubmitRequestCall(
  sourceChainId: number,
  dstChainId: number,
  requestType: RequestType,
  to: Address,
  token: Token,
  amount: number
): Promise<BuildSubmitRequestCallResponse> {
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
    srcChain.contracts.mockAccountTracker,
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
    dstChain.contracts.mockAccountTracker,
    dstChain.contracts.paymaster,
    attributes,
    dstChainId
  );

  const address = srcChain.contracts.outboxContracts[outboxName];
  const args: Args = [
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

  const innerRequest = encodeFunctionData({
    abi: Outbox,
    functionName: "sendMessage",
    args,
  });

  const calls: Call[] = [
    {
      to: srcChain.contracts.mockAccountTracker,
      data: encodeFunctionData({
        abi: MockAccountTracker,
        functionName: "request",
        args: [address, innerRequest, token.address, value],
      }),
      value: BigInt(0),
    },
  ];

  return {
    success: true,
    data: { id, calls, args, sender: addressToBytes32(address) },
  };
}

async function buildPayload(
  requestType: RequestType,
  token: Token,
  amount: number,
  eoaAccount: Address,
  to: Address,
  paymaster: Address,
  attributes: Hex[],
  dstChainId: number
): Promise<Hex> {
  console.log("Building payload");
  const calls: OnchainCall[] = [];

  if (token.id === TokenType.USDC) {
    calls.push({
      to: addressToBytes32(token.address),
      data: encodeFunctionData({
        abi: MockToken,
        functionName: "approve",
        args: [to, parseEther(amount.toString())],
      }),
      value: BigInt(0),
    });
  }

  const callDst = addressToBytes32(to);
  const data = encodeFunctionData({
    abi: MockAccountTracker,
    functionName: "deposit",
    args: [eoaAccount, token.address, parseEther(amount.toString())],
  });
  const value =
    token.id === TokenType.ETH ? parseEther(amount.toString()) : BigInt(0);

  calls.push({ to: callDst, data, value });

  if (requestType === RequestType.Standard) {
    return encodeAbiParameters(Calls, [calls]);
  }

  return await buildUserOp(
    chains[dstChainId].contracts.smartAccount,
    paymaster,
    attributes,
    amount,
    dstChainId,
    token.address,
    calls
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
  token: Address,
  innerCalls: OnchainCall[]
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
      functionName: "executeUserOpWithCalls",
      args: [paymaster, addressToBytes32(token), innerCalls],
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
    args: [account, BigInt(0)],
  });
}
