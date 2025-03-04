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
  ApproveAccount,
  ApprovePaymaster,
  PrefundPaymasterGas,
  PrefundAccount,
}

const approveAccount: Step = {
  id: StepId.ApproveAccount,
  name: "Approve Account",
  chainTarget: TransactionTarget.SRC,
  description:
    "Before funding your mock account with USDC, you'll need to approve the contract to access these tokens.",
};
const approvePaymaster: Step = {
  id: StepId.ApprovePaymaster,
  name: "Approve Paymaster",
  chainTarget: TransactionTarget.DST,
  description:
    "Before depositing ERC20 tokens to a destination chain paymaster, you'll need to approve the paymaster contract to access your tokens.",
};
const prefundPaymaster: Step = {
  id: StepId.PreFundPaymaster,
  name: "Pre-fund Paymaster",
  chainTarget: TransactionTarget.DST,
  description:
    "As a fulfiler, you have the option to pre-deposit funds to the destination chain paymaster to cover execution costs. This approach allows you to support both standard and smart account requests using the same funding source, which improves your capital efficiency.",
};
const prefundPaymasterGas: Step = {
  id: StepId.PrefundPaymasterGas,
  name: "Prefund Paymaster Gas",
  chainTarget: TransactionTarget.DST,
  description:
    "To support smart account requests, fulfillers need to deposit ETH into the destination chain's EntryPoint contract. This deposit is made through the Paymaster, allowing it to track each fulfiller's gas balance.",
};
const submitRequest: Step = {
  id: StepId.SubmitRequest,
  name: "Submit request",
  chainTarget: TransactionTarget.SRC,
  description:
    "To begin, a user will submit a cross-chain call request to the source chain's Outbox contract. This demo's request specifies a transfer of either ETH or USDC from the destination chain's Inbox contract to your account address on that chain. When you submit this request, your funds are locked in the Outbox contract on the source chain. Later, when a fulfiller completes your request on the destination chain, they can claim these locked funds.",
};
const fulfillRequest: Step = {
  id: StepId.FulfillRequest,
  name: "Fulfill request",
  chainTarget: TransactionTarget.DST,
  description:
    "After validating the request parameters, you can fulfill the request by submitting a transaction to the destination chain's Inbox contract. This process requests the necessary funds from the paymaster contract and executes the user's defined calls.",
};
const generateProof: Step = {
  id: StepId.GenerateProof,
  name: "Generate Proof",
  chainTarget: TransactionTarget.NONE,
  description:
    "Once the destination chain reaches finality, you can generate a storage proof. This proof verifies that an execution receipt exists in the destination chain's Inbox contract storage. For this demo, you don't need to wait before proceeding.",
};
const submitHashiHeader: Step = {
  id: StepId.SubmitHashiHeader,
  name: "Submit Hashi Header",
  chainTarget: TransactionTarget.SRC,
  description:
    "We can skip destination chain finality waiting times for this demo by utilizing Hashi, a blockchain oracle aggregator that we use to share block headers between chains. Click 'transact' below to submit destination chain block headers to the source chain, enabling immediate proof verification.",
};
const claimReward: Step = {
  id: StepId.ClaimReward,
  name: "Claim reward",
  chainTarget: TransactionTarget.SRC,
  description:
    "Finally, you can submit your generated proof to the source chain Outbox contract to claim your reward, which was secured during the initial 'Submit Request' step.",
};
const prefundAccount: Step = {
  id: StepId.PrefundAccount,
  name: "Prefund Account",
  chainTarget: TransactionTarget.SRC,
  description:
    "Your connected wallet address will fulfill transaction requests in this demo. To experience a realistic fund flow, you'll need to add tokens to a test account for cross-chain transactions. Don't worry - you can withdraw these funds at any time! Begin by specifying your desired request config on the right.",
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
      approveAccount,
      prefundAccount,
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
      approveAccount,
      prefundAccount,
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
