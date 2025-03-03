import { buildTransaction, BuildTransactionResponse } from "@/app/lib/actions";
import { buildApproveCall } from "@/app/lib/buildApproveCall";
import { buildClaimRewardCall } from "@/app/lib/buildClaimRewardCall";
import { buildFulfillmentCall } from "@/app/lib/buildFulfillmentCall";
import { buildMagicSpendCall } from "@/app/lib/buildMagicSpendCall";
import { buildPaymasterGasCall } from "@/app/lib/buildPaymasterGasCall";
import { buildShoyuBashiCall } from "@/app/lib/buildShoyuBashiCall";
import { buildWithdrawGasCall } from "@/app/lib/buildWithdrawGasCall";
import { buildWithdrawMagicSpendCall } from "@/app/lib/buildWithdrawMagicSpendCall";
import { StepId } from "@/config/steps";
import addressToBytes32 from "@/utils/addressToBytes32";
import { Call } from "@/utils/types/call";
import { ProofType } from "@/utils/types/proof";
import { Request, RequestType } from "@/utils/types/request";
import { SelectionItem } from "@/utils/types/selectionItem";
import { Token } from "@/utils/types/tokenType";
import { useEffect, useState } from "react";
import { Address, toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

interface UseTransactionParamsProps {
  stepId: StepId;
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  requestType: RequestType;
  selectedToken: Token;
  amount: number;
  request?: Request;
  setRequest: (request: Request) => void;
  proof?: ProofType;
}

export default function useTransactionParams(props: UseTransactionParamsProps) {
  let { address } = useAccount();

  if (!address) {
    address = zeroAddress;
  }

  const [calls, setCalls] = useState<Call[]>([]);

  useEffect(() => {
    setCalls([]);
    switch (props.stepId) {
      case StepId.PreFundPaymaster:
        handlePrefundPaymaster(
          props.destinationChain.id,
          props.selectedToken,
          props.amount
        );
        break;
      case StepId.SubmitRequest:
        handleBuildSubmission(
          address,
          props.amount,
          props.sourceChain.id,
          props.destinationChain.id,
          props.requestType,
          props.selectedToken
        );
        break;
      case StepId.FulfillRequest:
        handleBuildFulfillment(props.request);
        break;
      case StepId.SubmitHashiHeader:
        handleBuildShoyuBashiCall(props.request);
        break;
      case StepId.ClaimReward:
        handleBuildClaimRewardCall(address, props.request);
        break;
      case StepId.ApproveOutbox:
        handleBuildApproveOutbox(
          props.selectedToken.address,
          props.sourceChain.id,
          props.amount
        );
        break;
      case StepId.ApprovePaymaster:
        handleBuildApprovePaymaster(
          props.selectedToken.address,
          props.destinationChain.id,
          props.amount
        );
        break;
      case StepId.PrefundPaymasterGas:
        handleBuildPaymasterGas(props.destinationChain.id);
        break;
      case StepId.RefundMagicSpend:
        handleBuildRefundMagicSpend(
          props.destinationChain.id,
          props.selectedToken.address,
          address
        );
        break;
      case StepId.RefundGas:
        handleBuildRefundGas(props.destinationChain.id, address);
        break;
    }
  }, [
    address,
    props.amount,
    props.sourceChain.id,
    props.destinationChain.id,
    props.requestType,
    props.selectedToken.id,
    props.stepId,
    props.request?.id,
  ]);

  const handleBuildRefundGas = (chainId: number, address: Address) => {
    buildWithdrawGasCall(chainId, address).then((res) => {
      console.log("Build refund gas res", res);
      setCalls(res.data.calls);
    });
  };

  const handleBuildRefundMagicSpend = (
    chainId: number,
    token: Address,
    address: Address
  ) => {
    buildWithdrawMagicSpendCall(chainId, token, address).then((res) => {
      console.log("Build refund magic spend res", res);
      setCalls(res.data.calls);
    });
  };

  const handleBuildPaymasterGas = (chainId: number) => {
    buildPaymasterGasCall(chainId).then((res) => {
      console.log("Paymaster gas res", res);
      setCalls(res.data.calls);
    });
  };

  const handleBuildApproveOutbox = (
    tokenAddress: Address,
    srcChainId: number,
    amount: number
  ) => {
    if (amount > 0) {
      buildApproveCall(tokenAddress, srcChainId, true, amount, true).then(
        (res) => {
          console.log("Approve res", res);
          setCalls(res.data.calls);
        }
      );
    }
  };

  const handleBuildApprovePaymaster = (
    tokenAddress: Address,
    dstChainId: number,
    amount: number
  ) => {
    if (amount > 0) {
      buildApproveCall(tokenAddress, dstChainId, false, amount, false).then(
        (res) => {
          console.log("Approve res", res);
          setCalls(res.data.calls);
        }
      );
    }
  };

  const handlePrefundPaymaster = (
    dstChainId: number,
    token: Token,
    amount: number
  ) => {
    if (amount > 0) {
      buildMagicSpendCall(dstChainId, token, amount).then((res) => {
        console.log("Magic Spend res", res);
        setCalls(res.data.calls);
      });
    } else {
      setCalls([]);
    }
  };

  const handleBuildSubmission = (
    addr: Address,
    amount: number,
    srcChainId: number,
    dstChainId: number,
    requestType: RequestType,
    selectedToken: Token
  ) => {
    if (addr != zeroAddress && amount > 0 && srcChainId !== dstChainId) {
      buildTransaction(
        srcChainId,
        dstChainId,
        requestType,
        addr,
        selectedToken,
        amount
      ).then((res) => {
        handleBuildSubmissionResponse(requestType, srcChainId, res);
      });
    } else {
      setCalls([]);
    }
  };

  const handleBuildFulfillment = (req?: Request) => {
    if (!req || !address) {
      setCalls([]);
      return;
    }

    buildFulfillmentCall(req, address).then((res) => {
      console.log("Fulfillment res", res);
      if (res.success) {
        setCalls(res.data.calls);
      }
    });
  };

  const handleBuildShoyuBashiCall = (req?: Request) => {
    if (!req || !address || !props.proof) {
      setCalls([]);
      return;
    }

    buildShoyuBashiCall(req, props.proof).then((res) => {
      console.log("Build ShoyuBashi call res", res);
      if (res.success) {
        setCalls(res.data.calls);
      }
    });
  };

  const handleBuildClaimRewardCall = (addr: Address, req?: Request) => {
    if (!req || addr == zeroAddress || !props.proof) {
      setCalls([]);
      return;
    }

    buildClaimRewardCall(req, props.proof, addr).then((res) => {
      console.log("Build Claim Reward res", res);
      if (res.success) {
        setCalls(res.data.calls);
      }
    });
  };

  const handleBuildSubmissionResponse = (
    requestType: RequestType,
    srcChainId: number,
    res: BuildTransactionResponse
  ) => {
    console.log(res);
    if (res.success) {
      setCalls(res.data.calls);
      const [dstChain, receiver, payload, attributes] = res.data.args;
      const req: Request = {
        id: res.data.id,
        srcChain: toHex(srcChainId, { size: 32 }),
        sender: addressToBytes32(res.data.calls[0].to),
        dstChain,
        receiver,
        payload,
        attributes,
        requestType,
      };
      props.setRequest(req);
    }
  };

  return { calls };
}
