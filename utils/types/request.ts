import { Hex } from "viem";

export enum RequestType {
  Standard,
  SmartAccount,
}

export type Request = {
  id: Hex;
  srcChain: Hex;
  sender: Hex;
  dstChain: Hex;
  receiver: Hex;
  payload: Hex;
  attributes: Hex[];
  requestType: RequestType;
};
