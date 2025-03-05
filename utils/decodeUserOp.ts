import PackedUserOperation from "@/abis/PackedUserOperation";
import { decodeAbiParameters, type Hex } from "viem";
import { UserOp } from "./types/userOp";

export default function decodeUserOp(payload: Hex): UserOp {
  const [op] = decodeAbiParameters(PackedUserOperation, payload);
  return op;
}
