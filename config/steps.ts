import { RequestType } from "@/utils/types/request";
import { Step, TransactionTarget } from "@/utils/types/step";
import { TokenType } from "@/utils/types/tokenType";

export enum StepId {
  PreFundPaymaster,
  SubmitRequest,
  FulfillRequest,
  GenerateProof,
  SubmitHashiHeader,
  ClaimReward,
  ApproveOutbox,
  ApprovePaymaster,
  PrefundPaymasterGas,
  RefundMagicSpend,
  RefundGas,
}

const approveOutbox = {
  id: StepId.ApproveOutbox,
  name: "Approve Outbox",
  chainTarget: TransactionTarget.SRC,
};
const approvePaymaster = {
  id: StepId.ApprovePaymaster,
  name: "Approve Paymaster",
  chainTarget: TransactionTarget.DST,
};
const prefundPaymaster = {
  id: StepId.PreFundPaymaster,
  name: "Pre-fund Paymaster",
  chainTarget: TransactionTarget.DST,
};
const prefundPaymasterGas = {
  id: StepId.PrefundPaymasterGas,
  name: "Prefund Paymaster Gas",
  chainTarget: TransactionTarget.DST,
};
const submitRequest = {
  id: StepId.SubmitRequest,
  name: "Submit request",
  chainTarget: TransactionTarget.SRC,
};
const fulfillRequest = {
  id: StepId.FulfillRequest,
  name: "Fulfill request",
  chainTarget: TransactionTarget.DST,
};
const generateProof = {
  id: StepId.GenerateProof,
  name: "Generate Proof",
  chainTarget: TransactionTarget.NONE,
};
const submitHashiHeader = {
  id: StepId.SubmitHashiHeader,
  name: "Submit Hashi Header",
  chainTarget: TransactionTarget.SRC,
};
const claimReward = {
  id: StepId.ClaimReward,
  name: "Claim reward",
  chainTarget: TransactionTarget.SRC,
};
const refundMagicSpend = {
  id: StepId.RefundMagicSpend,
  name: "Refund Magic Spend",
  chainTarget: TransactionTarget.DST,
};
const refundGas = {
  id: StepId.RefundGas,
  name: "Refund Gas",
  chainTarget: TransactionTarget.DST,
};

export const steps: Record<RequestType, Record<TokenType, Step[]>> = {
  [RequestType.Standard]: {
    [TokenType.ETH]: [
      prefundPaymaster,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
      refundMagicSpend,
    ],
    [TokenType.USDC]: [
      approveOutbox,
      approvePaymaster,
      prefundPaymaster,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
      refundMagicSpend,
    ],
  },
  [RequestType.SmartAccount]: {
    [TokenType.ETH]: [
      prefundPaymaster,
      prefundPaymasterGas,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
      refundMagicSpend,
      refundGas,
    ],
    [TokenType.USDC]: [
      approveOutbox,
      approvePaymaster,
      prefundPaymaster,
      prefundPaymasterGas,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
      refundMagicSpend,
      refundGas,
    ],
  },
};
