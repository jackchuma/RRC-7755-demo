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
}: StepVisualizerProps) {
  const { calls } = useTransactionParams({
    currentStep,
    sourceChain,
    destinationChain,
    requestType,
    selectedToken,
    amount,
    request,
    setRequest,
  });
  const { address } = useAccount();

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    if (status.statusName === "success") {
      onNextStep();
    }
  }, []);

  let transactionChain: number;

  switch (steps[currentStep].chainTarget) {
    case TransactionTarget.SRC:
      transactionChain = sourceChain.id;
      break;
    case TransactionTarget.DST:
      transactionChain = destinationChain.id;
  }

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
