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

export const steps: Record<TokenType, Step[]> = {
  [TokenType.ETH]: [
    prefundPaymaster,
    submitRequest,
    fulfillRequest,
    generateProof,
    submitHashiHeader,
    claimReward,
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
  ],
};
