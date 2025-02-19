import { Hex } from "viem";

export type Call = {
  to: Hex;
  data?: Hex;
  value?: bigint;
};
