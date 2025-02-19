import { Address } from "viem";
import { SelectionItem } from "./selectionItem";

export enum TokenType {
  ETH,
  USDC,
}

export type Token = SelectionItem & { address: Address };
