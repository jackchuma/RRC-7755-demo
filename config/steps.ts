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

const approveOutbox: Step = {
  id: StepId.ApproveOutbox,
  name: "Approve Outbox",
  chainTarget: TransactionTarget.SRC,
  description: "",
};
const approvePaymaster: Step = {
  id: StepId.ApprovePaymaster,
  name: "Approve Paymaster",
  chainTarget: TransactionTarget.DST,
  description: "",
};
const prefundPaymaster: Step = {
  id: StepId.PreFundPaymaster,
  name: "Pre-fund Paymaster",
  chainTarget: TransactionTarget.DST,
  description: "",
};
const prefundPaymasterGas: Step = {
  id: StepId.PrefundPaymasterGas,
  name: "Prefund Paymaster Gas",
  chainTarget: TransactionTarget.DST,
  description: "",
};
const submitRequest: Step = {
  id: StepId.SubmitRequest,
  name: "Submit request",
  chainTarget: TransactionTarget.SRC,
  description: "",
};
const fulfillRequest: Step = {
  id: StepId.FulfillRequest,
  name: "Fulfill request",
  chainTarget: TransactionTarget.DST,
  description: "",
};
const generateProof: Step = {
  id: StepId.GenerateProof,
  name: "Generate Proof",
  chainTarget: TransactionTarget.NONE,
  description: "",
};
const submitHashiHeader: Step = {
  id: StepId.SubmitHashiHeader,
  name: "Submit Hashi Header",
  chainTarget: TransactionTarget.SRC,
  description: "",
};
const claimReward: Step = {
  id: StepId.ClaimReward,
  name: "Claim reward",
  chainTarget: TransactionTarget.SRC,
  description: "",
};
const refundMagicSpend: Step = {
  id: StepId.RefundMagicSpend,
  name: "Refund Magic Spend",
  chainTarget: TransactionTarget.DST,
  description: "",
};
const refundGas: Step = {
  id: StepId.RefundGas,
  name: "Refund Gas",
  chainTarget: TransactionTarget.DST,
  description: "",
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
