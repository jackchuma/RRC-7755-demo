import PackedUserOperation from "@/abis/PackedUserOperation";
import { decodeAbiParameters, type Hex } from "viem";

export default function decodeUserOp(payload: Hex): any {
  const [op] = decodeAbiParameters(PackedUserOperation, payload);
  return op;
}
