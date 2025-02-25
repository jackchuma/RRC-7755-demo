import { TokenType } from "@/utils/types/tokenType";
import { Address } from "viem";

export const tokens = [
  {
    id: TokenType.ETH,
    name: "ETH",
    icon: "ETH",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address,
  },
  {
    id: TokenType.USDC,
    name: "USDC",
    icon: "USDC",
    address: "0x8c9924434AfFc441BD53E30909402A5C15283aE6" as Address,
  },
];
