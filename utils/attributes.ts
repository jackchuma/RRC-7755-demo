import { Address, Hex, toHex } from "viem";
import addressToBytes32 from "./addressToBytes32";

const rewardAttributeSelector = "0xa362e5db";
const delayAttributeSelector = "0x84f550e0";
const l2OracleAttributeSelector = "0x7ff7245a";
const nonceAttributeSelector = "0xce03fdab";
const requesterAttributeSelector = "0x3bd94e4c";
const shoyuBashiAttributeSelector = "0xda07e15d";
const destinationChainSelector = "0xdff49bf1";

export default class Attributes {
  private attributes: Hex[];

  constructor() {
    this.attributes = [];
  }

  list(): Hex[] {
    return this.attributes;
  }

  addReward(asset: Hex, amount: bigint): void {
    this.attributes.push(
      `${rewardAttributeSelector}${asset.slice(2)}${toHex(amount, {
        size: 32,
      }).slice(2)}`
    );
  }

  addDelay(finalityDelay: number, expiry: number): void {
    this.attributes.push(
      `${delayAttributeSelector}${toHex(finalityDelay, { size: 32 }).slice(
        2
      )}${toHex(expiry, { size: 32 }).slice(2)}`
    );
  }

  addNonce(nonce: number): void {
    this.attributes.push(
      `${nonceAttributeSelector}${toHex(nonce, { size: 32 }).slice(2)}`
    );
  }

  addRequester(requester: Hex): void {
    this.attributes.push(
      `${requesterAttributeSelector}${addressToBytes32(requester).slice(2)}`
    );
  }

  addL2Oracle(l2Oracle: Address): void {
    this.attributes.push(
      `${l2OracleAttributeSelector}${addressToBytes32(l2Oracle).slice(2)}`
    );
  }

  addShoyuBashi(shoyuBashi: Address): void {
    this.attributes.push(
      `${shoyuBashiAttributeSelector}${addressToBytes32(shoyuBashi).slice(2)}`
    );
  }

  addDestinationChainId(dstChainId: number): void {
    this.attributes.push(
      `${destinationChainSelector}${toHex(dstChainId, { size: 32 }).slice(2)}`
    );
  }
}
