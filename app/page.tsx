"use client";

import { useState } from "react";
import { Address } from "viem";

import ChainVisualizer from "../components/ChainVisualizer";
import StepVisualizer from "../components/StepVisualizer";
import WalletConnection from "../components/WalletConnection";
import Selector from "../components/Selector";
import AmountInput from "../components/AmountInput";
import { Request, RequestType } from "@/utils/types/request";
import { TokenType } from "@/utils/types/tokenType";
import { steps } from "@/config/steps";

const chains = [
  { id: 84532, name: "Base Sepolia", icon: "🔷" },
  { id: 11155420, name: "Optimism Sepolia", icon: "🔴" },
  { id: 421614, name: "Arbitrum Sepolia", icon: "🔵" },
];

const tokens = [
  {
    id: TokenType.ETH,
    name: "ETH",
    icon: "ETH",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address,
  },
  { id: TokenType.USDC, name: "USDC", icon: "USDC", address: "" as Address }, // TODO: Deploy mock ERC20
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
  const [currentStep, setCurrentStep] = useState(0);
  const [sourceChain, setSourceChain] = useState(chains[2]);
  const [destinationChain, setDestinationChain] = useState(chains[0]);
  const [request, setRequest] = useState<Request>();
  const [sourceChainBalance, setSourceChainBalance] = useState({
    [TokenType.ETH]: 10,
    [TokenType.USDC]: 1000,
  });
  const [destinationChainBalance, setDestinationChainBalance] = useState({
    [TokenType.ETH]: 5,
    [TokenType.USDC]: 500,
  });
  const [requestType, setRequestType] = useState(requests[0]);
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState("");

  const handleNextStep = () => {
    const maxSteps = steps.length;
    if (currentStep < maxSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      // Simulate balance changes
      if (currentStep === 1) {
        const amountToSend = Number.parseFloat(amount);
        setSourceChainBalance((prev) => ({
          ...prev,
          [selectedToken.id]: prev[selectedToken.id] - amountToSend,
        }));
        setDestinationChainBalance((prev) => ({
          ...prev,
          [selectedToken.id]: prev[selectedToken.id] + amountToSend,
        }));
      }
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

  return (
    <div className="min-h-screen bg-[#101218] text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">RRC-7755 Demo</h1>
      <WalletConnection />
      <div className="flex flex-col lg:flex-row justify-between items-start mt-8">
        <div className="w-full lg:w-1/4">
          <Selector
            items={chains}
            selected={sourceChain}
            onChange={handleSourceChainChange}
            label="Source Chain"
            displayIcon={true}
            disabled={currentStep > 0}
          />
          <ChainVisualizer
            chain={sourceChain}
            balance={sourceChainBalance}
            isSource={true}
            currentStep={currentStep}
          />
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
            maxAmount={sourceChainBalance[selectedToken.id]}
            disabled={currentStep > 0}
          />
        </div>
        <StepVisualizer
          steps={steps}
          currentStep={currentStep}
          onNextStep={handleNextStep}
          sourceChain={sourceChain}
          destinationChain={destinationChain}
          requestType={requestType.id as RequestType}
          selectedToken={selectedToken}
          amount={+amount}
          request={request}
          setRequest={handleSetRequest}
        />
        <div className="w-full lg:w-1/4">
          <Selector
            items={chains}
            selected={destinationChain}
            onChange={handleDestinationChainChange}
            label="Destination Chain"
            displayIcon={true}
            disabled={currentStep > 0}
          />
          <ChainVisualizer
            chain={destinationChain}
            balance={destinationChainBalance}
            isSource={false}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
