import { TokenType } from "./tokenType";

export type Balance = {
  [TokenType.ETH]: number;
  [TokenType.USDC]: number;
};
