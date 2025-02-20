import { buildTransaction, BuildTransactionResponse } from "@/app/lib/actions";
import { buildFulfillmentCall } from "@/app/lib/buildFulfillmentCall";
import { generateProof } from "@/app/lib/generateProof";
import chains from "@/config/chains";
import addressToBytes32 from "@/utils/addressToBytes32";
import { Call } from "@/utils/types/call";
import { ProofType } from "@/utils/types/proof";
import { Request, RequestType } from "@/utils/types/request";
import { SelectionItem } from "@/utils/types/selectionItem";
import { Token } from "@/utils/types/tokenType";
import { useEffect, useState } from "react";
import { Address, toHex, zeroAddress } from "viem";
import { sepolia } from "viem/chains";
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
}

export default function useTransactionParams(props: UseTransactionParamsProps) {
  let { address } = useAccount();

  if (!address) {
    address = zeroAddress;
  }

  const [calls, setCalls] = useState<Call[]>([]);
  const [proof, setProof] = useState<ProofType>();

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
      default:
        genProof(
          props.sourceChain.id,
          props.destinationChain.id,
          props.request
        );
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

  const genProof = (srcChainId: number, dstChainId: number, req?: Request) => {
    if (!req) {
      setProof(undefined);
      return;
    }

    const timestampCutoff = 0; // TODO: add timestamp cutoff to req

    generateProof(
      srcChainId,
      sepolia.id,
      dstChainId,
      req.id,
      timestampCutoff
    ).then((res) => {
      console.log("Proof generation res", res);
      if (res.success) {
        setProof(res.data.proof);
      }
    });
  };

  return { calls, proof };
}
