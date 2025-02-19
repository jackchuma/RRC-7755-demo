import { useAccount } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { ContractFunctionParameters, zeroAddress } from "viem";
import {
  LifecycleStatus,
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";

import { RequestType } from "@/utils/types/requestType";
import { SelectionItem } from "@/utils/types/selectionItem";
import { Token } from "@/utils/types/tokenType";
import { buildTransaction } from "@/app/lib/actions";
import { Call } from "@/utils/types/call";

interface StepVisualizerProps {
  steps: string[];
  currentStep: number;
  onNextStep: () => void;
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  requestType: RequestType;
  selectedToken: Token;
  amount: number;
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
}: StepVisualizerProps) {
  let { address } = useAccount();

  if (!address) {
    address = zeroAddress;
  }

  const [calls, setCalls] = useState<Call[]>([]);

  useEffect(() => {
    if (
      address != zeroAddress &&
      amount > 0 &&
      sourceChain.id !== destinationChain.id
    ) {
      buildTransaction(
        sourceChain.id,
        destinationChain.id,
        requestType,
        address,
        selectedToken,
        amount
      ).then((res) => {
        console.log(res);
        if (res.success) {
          setCalls(res.data);
        }
      });
    } else {
      setCalls([]);
    }
  }, [
    address,
    amount,
    sourceChain.id,
    destinationChain.id,
    requestType,
    selectedToken.id,
  ]);

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log("LifecycleStatus", status);
    if (status.statusName === "success") {
      onNextStep();
    }
  }, []);

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
              {step}
            </h3>
            {index === currentStep && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">
                  {sourceChain.icon} {sourceChain.name} →{" "}
                  {destinationChain.icon} {destinationChain.name}
                </p>
                {address && calls.length > 0 && (
                  <>
                    <p className="text-sm text-gray-400 mb-2">
                      Sending {amount} {selectedToken.icon}
                    </p>
                    <Transaction
                      chainId={sourceChain.id}
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
