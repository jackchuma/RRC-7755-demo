import { useAccount } from "wagmi";
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

  const handleOnStatus = (status: LifecycleStatus) => {
    if (status.statusName === "success") {
      onNextStep();
    }
  };

  const handleGenerateProof = async () => {
    await genProof(destinationChain.id, request);
  };

  const genProof = async (dstChainId: number, req?: Request) => {
    if (!req) {
      setProof(undefined);
      return;
    }

    const timestampCutoff = 0; // TODO: add timestamp cutoff to req

    const res = await generateProof(dstChainId, req.id, timestampCutoff);

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
    "w-full rounded-xl px-4 py-3 font-medium text-base bg-primary text-primary-foreground leading-6 cursor-pointer transition-all hover:bg-primary-hover active:scale-[0.98] shadow-sm";

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-1 gradient-text">
        {requestType === RequestType.Standard
          ? "Standard Request"
          : "4337 Smart Account Request"}
      </h2>

      <div className="bg-card/30 rounded-lg p-3 border border-border/30 flex items-center gap-2 mb-6">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Sending <span className="font-medium text-white">{amount}</span>
          <span>{selectedToken.icon}</span> from
        </p>
        <span className="text-sm text-muted-foreground">
          {sourceChain.icon} {sourceChain.name}
          <span className="mx-2">→</span>
          {destinationChain.icon} {destinationChain.name}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-purple-500/50 rounded-full"></div>

        <div className="space-y-8 pl-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative transition-all duration-300 ${
                index < currentStep
                  ? "opacity-100"
                  : index === currentStep
                  ? "opacity-100"
                  : "opacity-100"
              }`}
            >
              <div
                className={`absolute -left-12 flex items-center justify-center w-8 h-8 rounded-full transition-all z-10 ${
                  index < currentStep
                    ? "bg-[#101218] text-emerald-400 border-2 border-emerald-500"
                    : index === currentStep
                    ? "bg-[#101218] text-blue-400 border-2 border-blue-500 animate-pulse"
                    : "bg-[#101218] text-gray-400 border-2 border-gray-700"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              <div>
                <h3
                  className={`font-medium text-lg mb-1 ${
                    index < currentStep
                      ? "text-emerald-400"
                      : index === currentStep
                      ? "text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {step.name}
                </h3>

                {index === currentStep && (
                  <p
                    className={`text-sm mb-2 ${
                      index < currentStep
                        ? "text-emerald-400/80"
                        : index === currentStep
                        ? "text-blue-400/80"
                        : "text-gray-400/80"
                    }`}
                  >
                    {step.description}
                  </p>
                )}

                {index === currentStep && (
                  <div className="mt-4 space-y-4 animate-fade-in">
                    {step.id === StepId.GenerateProof && (
                      <div className="space-y-4">
                        {proof ? (
                          <>
                            <div className="bg-card/40 rounded-lg p-4 border border-border/30">
                              <ProofVisualizer proof={proof} />
                            </div>
                            <button
                              className={buttonClassName}
                              onClick={onNextStep}
                            >
                              Continue to Next Step
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
                      </div>
                    )}

                    {address && transactionChain && calls.length > 0 && (
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
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
