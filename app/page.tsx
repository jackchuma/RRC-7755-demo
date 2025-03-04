"use client";

import { useState } from "react";

import StepVisualizer from "../components/StepVisualizer";
import WalletConnection from "../components/WalletConnection";
import Selector from "../components/Selector";
import AmountInput from "../components/AmountInput";
import MenuIcon from "../components/MenuIcon";
import { Request, RequestType } from "@/utils/types/request";
import { TokenType } from "@/utils/types/tokenType";
import { steps } from "@/config/steps";
import { ProofType } from "@/utils/types/proof";
import useBalance from "@/hooks/useBalance";
import { tokens } from "@/config/tokens";
import BalancesPanel from "@/components/BalancesPanel";
import { buildWithdrawMagicSpendCall } from "./lib/buildWithdrawMagicSpendCall";
import { useAccount } from "wagmi";
import { Call } from "@/utils/types/call";
import { buildWithdrawGasCall } from "./lib/buildWithdrawGasCall";
import { buildWithdrawAccountCall } from "./lib/buildWithdrawAccountCall";

const chains = [
  { id: 84532, name: "Base Sepolia", icon: "🔷" },
  { id: 11155420, name: "Optimism Sepolia", icon: "🔴" },
  { id: 421614, name: "Arbitrum Sepolia", icon: "🔵" },
];

const requests = [
  { id: RequestType.Standard, name: "Standard Request", icon: "" },
  {
    id: RequestType.SmartAccount,
    name: "4337 Smart Account Request",
    icon: "",
  },
];

export default function Home() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceChain, setSourceChain] = useState(chains[2]);
  const [destinationChain, setDestinationChain] = useState(chains[0]);
  const [request, setRequest] = useState<Request>();
  const [proof, setProof] = useState<ProofType>();
  const [requestType, setRequestType] = useState(requests[0]);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState("");

  const sourceChainBalances = useBalance(sourceChain.id, selectedToken);
  const destinationChainBalances = useBalance(
    destinationChain.id,
    selectedToken
  );

  const handleNextStep = () => {
    const maxSteps = steps[requestType.id][selectedToken.id].length;
    if (currentStep < maxSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSourceChainChange = (chainId: number) => {
    const newChain = chains.find((chain) => chain.id === chainId);
    if (newChain) setSourceChain(newChain);
  };

  const handleDestinationChainChange = (chainId: number) => {
    const newChain = chains.find((chain) => chain.id === chainId);
    if (newChain) setDestinationChain(newChain);
  };

  const handleRequestTypeChange = (type: RequestType) => {
    const newRequestType = requests.find((request) => request.id === type);
    if (newRequestType) setRequestType(newRequestType);
    setCurrentStep(0); // Reset steps when changing request type
  };

  const handleTokenChange = (tokenId: TokenType) => {
    const newToken = tokens.find((token) => token.id === tokenId);
    if (newToken) setSelectedToken(newToken);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
  };

  const handleSetRequest = (req: Request) => {
    setRequest(req);
  };

  const handleSetProof = (p?: ProofType) => {
    setProof(p);
  };

  const handleRefundMagicSpend = async (): Promise<Call[]> => {
    console.log("Refund magic spend action triggered");
    if (!address) {
      console.error("No address found");
      return [];
    }

    const res = await buildWithdrawMagicSpendCall(
      destinationChain.id,
      selectedToken.address,
      address
    );
    console.log(res);
    return res.data.amount > 0 ? res.data.calls : [];
  };

  const handleRefundGas = async (): Promise<Call[]> => {
    console.log("Refund gas action triggered");
    if (!address) {
      console.error("No address found");
      return [];
    }

    const res = await buildWithdrawGasCall(destinationChain.id, address);
    console.log(res);
    return res.data.amount > 0 ? res.data.calls : [];
  };

  const handleRefundAccount = async (): Promise<Call[]> => {
    console.log("Refund account action triggered");
    if (!address) {
      console.error("No address found");
      return [];
    }

    const res = await buildWithdrawAccountCall(
      sourceChain.id,
      address,
      selectedToken.address
    );
    console.log(res);
    return res.data.amount > 0 ? res.data.calls : [];
  };

  const handleReset = () => {
    console.log("Reset action triggered");
    setCurrentStep(0);
    setRequest(undefined);
    setProof(undefined);
    setAmount("");
  };

  // Menu options
  const menuOptions = [
    {
      label: "Withdraw from Paymaster",
      action: handleRefundMagicSpend,
      calls: handleRefundMagicSpend,
      isTransaction: true,
      chainId: destinationChain.id,
    },
    {
      label: "Withdraw from EntryPoint",
      action: handleRefundGas,
      calls: handleRefundGas,
      isTransaction: true,
      chainId: destinationChain.id,
    },
    {
      label: "Withdraw from Account",
      action: handleRefundAccount,
      calls: handleRefundAccount,
      isTransaction: true,
      chainId: sourceChain.id,
    },
    {
      label: "Reset",
      action: handleReset,
      calls: async () => [],
      isTransaction: false,
      chainId: 0,
    },
  ];

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 lg:px-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute right-0 top-0">
            <MenuIcon options={menuOptions} />
          </div>
          <div className="w-full">
            <h1 className="text-4xl font-bold text-center mb-2 gradient-text">
              RRC-7755 Demo
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              A modern cross-chain request for computation implementation
            </p>
            <div className="flex justify-center">
              <WalletConnection />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-8 animate-slide-up">
          <BalancesPanel
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            token={selectedToken}
            sourceBalances={sourceChainBalances}
            destinationBalances={destinationChainBalances}
            currentStep={currentStep}
            chains={chains}
            handleSourceChainChange={handleSourceChainChange}
            handleDestinationChainChange={handleDestinationChainChange}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div
            className="glass-card p-6 w-full lg:w-3/4 animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <StepVisualizer
              steps={steps[requestType.id][selectedToken.id]}
              currentStep={currentStep}
              onNextStep={handleNextStep}
              sourceChain={sourceChain}
              destinationChain={destinationChain}
              requestType={requestType.id as RequestType}
              selectedToken={selectedToken}
              amount={+amount}
              request={request}
              setRequest={handleSetRequest}
              proof={proof}
              setProof={handleSetProof}
            />
          </div>

          <div
            className="glass-card py-6 px-3 w-full lg:w-1/4 animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-xl font-semibold mb-4 gradient-text">
              Configuration
            </h2>
            <div className="space-y-6">
              <Selector
                items={requests}
                selected={requestType}
                onChange={handleRequestTypeChange}
                label="Request Type"
                displayIcon={false}
                disabled={currentStep > 0}
              />
              <Selector
                items={tokens}
                selected={selectedToken}
                onChange={handleTokenChange}
                label="Select Token"
                displayIcon={false}
                disabled={currentStep > 0}
              />
              <AmountInput
                amount={amount}
                onAmountChange={handleAmountChange}
                maxAmount={
                  currentStep === 0
                    ? sourceChainBalances.fulfiller
                    : sourceChainBalances.account
                }
                disabled={currentStep > 0}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
