import { buildTransaction, BuildTransactionResponse } from "@/app/lib/actions";
import { buildClaimRewardCall } from "@/app/lib/buildClaimRewardCall";
import { buildFulfillmentCall } from "@/app/lib/buildFulfillmentCall";
import { buildShoyuBashiCall } from "@/app/lib/buildShoyuBashiCall";
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
  currentStep: number;
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
    switch (props.currentStep) {
      case 0:
        handleBuildSubmission(
          address,
          props.amount,
          props.sourceChain.id,
          props.destinationChain.id,
          props.requestType,
          props.selectedToken
        );
        break;
      case 1:
        handleBuildFulfillment(props.request);
        break;
      case 3:
        handleBuildShoyuBashiCall(props.request);
        break;
      case 4:
        handleBuildClaimRewardCall(address, props.request);
        break;
    }
  }, [
    address,
    props.amount,
    props.sourceChain.id,
    props.destinationChain.id,
    props.requestType,
    props.selectedToken.id,
    props.currentStep,
    props.request?.id,
  ]);

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
        dstValue: res.data.dstValue,
      };
      props.setRequest(req);
    }
  };

  return { calls };
}
