import { Address, Hex } from "viem";

export default function addressToBytes32(addr: Address): Hex {
  return `0x000000000000000000000000${addr.slice(2).toLowerCase()}`;
}
