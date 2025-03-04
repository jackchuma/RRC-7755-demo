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
  PrefundAccount,
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
const prefundAccount: Step = {
  id: StepId.PrefundAccount,
  name: "Prefund Account",
  chainTarget: TransactionTarget.SRC,
  description: "",
};

export const steps: Record<RequestType, Record<TokenType, Step[]>> = {
  [RequestType.Standard]: {
    [TokenType.ETH]: [
      prefundAccount,
      prefundPaymaster,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
    ],
    [TokenType.USDC]: [
      prefundAccount,
      approveOutbox,
      approvePaymaster,
      prefundPaymaster,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
    ],
  },
  [RequestType.SmartAccount]: {
    [TokenType.ETH]: [
      prefundAccount,
      prefundPaymaster,
      prefundPaymasterGas,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
    ],
    [TokenType.USDC]: [
      prefundAccount,
      approveOutbox,
      approvePaymaster,
      prefundPaymaster,
      prefundPaymasterGas,
      submitRequest,
      fulfillRequest,
      generateProof,
      submitHashiHeader,
      claimReward,
    ],
  },
};
