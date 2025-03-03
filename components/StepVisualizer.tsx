import { useAccount } from "wagmi";
import { useCallback } from "react";
import {
  LifecycleStatus,
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";

import { Request, RequestType } from "@/utils/types/request";
import { SelectionItem } from "@/utils/types/selectionItem";
import { Token } from "@/utils/types/tokenType";
import useTransactionParams from "@/hooks/useTransactionParams";
import { Step, TransactionTarget } from "@/utils/types/step";
import ProofVisualizer from "./ProofVisualizer";
import { ProofType } from "@/utils/types/proof";
import { generateProof } from "@/app/lib/generateProof";
import { sepolia } from "viem/chains";
import { StepId } from "@/config/steps";

interface StepVisualizerProps {
  steps: Step[];
  currentStep: number;
  onNextStep: () => void;
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  requestType: RequestType;
  selectedToken: Token;
  amount: number;
  request?: Request;
  setRequest: (request: Request) => void;
  proof?: ProofType;
  setProof: (proof?: ProofType) => void;
}

export default function StepVisualizer({
  steps,
  currentStep,
  onNextStep,
  sourceChain,
  destinationChain,
  requestType,
  selectedToken,
  amount,
  request,
  setRequest,
  proof,
  setProof,
}: StepVisualizerProps) {
  const { calls } = useTransactionParams({
    stepId: steps[currentStep].id,
    sourceChain,
    destinationChain,
    requestType,
    selectedToken,
    amount,
    request,
    setRequest,
    proof,
  });
  const { address } = useAccount();

  const handleOnStatus = useCallback(
    (status: LifecycleStatus) => {
      if (status.statusName === "success") {
        onNextStep();
      }
    },
    [currentStep]
  );

  const handleGenerateProof = async () => {
    await genProof(sourceChain.id, destinationChain.id, request);
  };

  const genProof = async (
    srcChainId: number,
    dstChainId: number,
    req?: Request
  ) => {
    if (!req) {
      setProof(undefined);
      return;
    }

    const timestampCutoff = 0; // TODO: add timestamp cutoff to req

    const res = await generateProof(
      srcChainId,
      sepolia.id,
      dstChainId,
      req.id,
      timestampCutoff
    );

    console.log("Proof generation res", res);
    if (res.success) {
      setProof(res.data.proof);
    }
  };

  let transactionChain: number;

  switch (steps[currentStep].chainTarget) {
    case TransactionTarget.SRC:
      transactionChain = sourceChain.id;
      break;
    case TransactionTarget.DST:
      transactionChain = destinationChain.id;
  }

  const buttonClassName =
    "w-full rounded-xl px-4 py-3 font-medium text-base text-black leading-6 cursor-pointer ock-bg-primary active:bg-[var(--ock-bg-primary-active)] hover:bg-[var(--ock-bg-primary-hover)]";

  return (
    <div className="w-full lg:w-1/2 mt-8 lg:mt-0 lg:px-8">
      <h2 className="text-2xl font-semibold mb-4">
        {requestType === RequestType.Standard
          ? "Standard Request"
          : "4337 Smart Account Request"}
      </h2>
      <ol className="relative border-l border-gray-700">
        {steps.map((step, index) => (
          <li key={index} className="mb-10 ml-6">
            <span
              className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ${
                index < currentStep
                  ? "bg-green-900 ring-green-900"
                  : index === currentStep
                  ? "bg-blue-900 ring-blue-900"
                  : "bg-gray-700 ring-gray-900"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </span>
            <h3
              className={`font-medium leading-tight ${
                index < currentStep
                  ? "text-green-400"
                  : index === currentStep
                  ? "text-blue-400"
                  : "text-gray-500"
              }`}
            >
              {step.name}
            </h3>
            {index === currentStep && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">
                  {sourceChain.icon} {sourceChain.name} →{" "}
                  {destinationChain.icon} {destinationChain.name}
                </p>
                {step.id === StepId.GenerateProof && (
                  <>
                    {proof ? (
                      <>
                        <ProofVisualizer proof={proof} />
                        <button
                          className={buttonClassName}
                          onClick={onNextStep}
                        >
                          Next
                        </button>
                      </>
                    ) : (
                      <button
                        className={buttonClassName}
                        onClick={handleGenerateProof}
                      >
                        Generate Proof
                      </button>
                    )}
                  </>
                )}
                {address && transactionChain && calls.length > 0 && (
                  <>
                    <p className="text-sm text-gray-400 mb-2">
                      Sending {amount} {selectedToken.icon}
                    </p>
                    <Transaction
                      chainId={transactionChain}
                      calls={calls}
                      onStatus={handleOnStatus}
                    >
                      <TransactionButton />
                      <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                      </TransactionStatus>
                    </Transaction>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
