"use client";

import { useState, useEffect } from "react";

import StepVisualizer from "../components/StepVisualizer";
import WalletConnection from "../components/WalletConnection";
import Selector from "../components/Selector";
import AmountInput from "../components/AmountInput";
import MenuIcon from "../components/MenuIcon";
import MintUSDCModal from "../components/MintUSDCModal";
import BalancesPanel from "../components/BalancesPanel";
import { Request, RequestType } from "@/utils/types/request";
import { TokenType } from "@/utils/types/tokenType";
import { steps } from "@/config/steps";
import { ProofType } from "@/utils/types/proof";
import useBalance from "@/hooks/useBalance";
import { tokens } from "@/config/tokens";
import {
  buildWithdrawMagicSpendCall,
  WithdrawCallResponse,
} from "./lib/buildWithdrawMagicSpendCall";
import { useAccount } from "wagmi";
import { buildWithdrawGasCall } from "./lib/buildWithdrawGasCall";
import { buildWithdrawAccountCall } from "./lib/buildWithdrawAccountCall";
import { SelectionItem } from "@/utils/types/selectionItem";
import { requests } from "@/config/requests";
import ETHWarningBanner from "../components/ETHWarningBanner";

const chains: SelectionItem[] = [
  { id: 84532, name: "Base Sepolia", icon: "🔷" },
  { id: 11155420, name: "Optimism Sepolia", icon: "🔴" },
  { id: 421614, name: "Arbitrum Sepolia", icon: "🔵" },
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
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [hasUSDC, setHasUSDC] = useState(false);
  const [showETHWarning, setShowETHWarning] = useState(true);

  const sourceChainBalances = useBalance(
    sourceChain.id,
    selectedToken,
    currentStep
  );
  const destinationChainBalances = useBalance(
    destinationChain.id,
    selectedToken,
    currentStep
  );

  // Check if user has USDC when address changes
  useEffect(() => {
    if (!address) return;

    const checkUSDC = async () => {
      try {
        const result = await fetch(`/api/check-usdc?address=${address}`);
        const data = await result.json();
        setHasUSDC(data.hasUSDC);
      } catch (error) {
        console.error("Error checking USDC balance:", error);
        setHasUSDC(false);
      }
    };

    checkUSDC();
  }, [address]);

  // Add a function to check if user has sufficient ETH on both chains
  const hasETHOnSourceChain = sourceChainBalances.fulfiller > 0.001; // Minimum ETH threshold
  const hasETHOnDestinationChain = destinationChainBalances.fulfiller > 0.001; // Minimum ETH threshold

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

  const handleRefundMagicSpend = async (
    chainId: number
  ): Promise<WithdrawCallResponse> => {
    console.log("Refund magic spend action triggered");
    if (!address) {
      console.error("No address found");
      return { success: false, data: { calls: [], amount: 0 } };
    }

    try {
      const res = await buildWithdrawMagicSpendCall(
        chainId,
        selectedToken.address,
        address
      );
      console.log("Withdrawal response:", res);
      return res;
    } catch (error) {
      console.error("Error building withdraw magic spend call:", error);
      return { success: false, data: { calls: [], amount: 0 } };
    }
  };

  const handleRefundGas = async (
    chainId: number
  ): Promise<WithdrawCallResponse> => {
    console.log("Refund gas action triggered");
    if (!address) {
      console.error("No address found");
      return { success: false, data: { calls: [], amount: 0 } };
    }

    try {
      const res = await buildWithdrawGasCall(chainId, address);
      console.log("Withdrawal response:", res);
      return res;
    } catch (error) {
      console.error("Error building withdraw gas call:", error);
      return { success: false, data: { calls: [], amount: 0 } };
    }
  };

  const handleRefundAccount = async (
    chainId: number
  ): Promise<WithdrawCallResponse> => {
    console.log("Refund account action triggered");
    if (!address) {
      console.error("No address found");
      return { success: false, data: { calls: [], amount: 0 } };
    }

    try {
      const res = await buildWithdrawAccountCall(
        chainId,
        address,
        selectedToken.address
      );
      console.log("Withdrawal response:", res);
      return res;
    } catch (error) {
      console.error("Error building withdraw account call:", error);
      return { success: false, data: { calls: [], amount: 0 } };
    }
  };

  const handleReset = () => {
    console.log("Reset action triggered");
    setCurrentStep(0);
    setRequest(undefined);
    setProof(undefined);
    setAmount("");
  };

  const menuOptions = [
    {
      label: "Paymaster Withdrawal",
      action: async () => {
        console.log("Paymaster Withdrawal action success");
      },
      calls: handleRefundMagicSpend,
      chainId: destinationChain.id,
    },
    {
      label: "EntryPoint Withdrawal",
      action: async () => {
        console.log("EntryPoint Withdrawal action success");
      },
      calls: handleRefundGas,
      chainId: destinationChain.id,
    },
    {
      label: "Account Withdrawal",
      action: async () => {
        console.log("Account Withdrawal action success");
      },
      calls: handleRefundAccount,
      chainId: sourceChain.id,
    },
    {
      label: "Reset",
      action: handleReset,
      calls: async () => ({ success: true, data: { calls: [], amount: 0 } }),
      chainId: 0,
    },
  ];

  const toggleMintModal = (open: boolean) => {
    setIsMintModalOpen(open);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      {address && showWelcomeBanner && !hasUSDC && (
        <div className="w-full max-w-5xl mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-full">
              <span className="text-xl">👋</span>
            </div>
            <div>
              <h3 className="font-medium">Welcome to the RRC-7755 Demo!</h3>
              <p className="text-sm text-muted-foreground">
                New to the site? You can mint mock USDC to test the demo.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMintModalOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Mint USDC
            </button>
            <button
              onClick={() => setShowWelcomeBanner(false)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ETH Warning Banner */}
      {address &&
        showETHWarning &&
        (!hasETHOnSourceChain || !hasETHOnDestinationChain) && (
          <ETHWarningBanner
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            sourceChainHasETH={hasETHOnSourceChain}
            destinationChainHasETH={hasETHOnDestinationChain}
            onClose={() => setShowETHWarning(false)}
          />
        )}

      {/* <div className="max-w-7xl mx-auto"> */}
      <div className="w-full max-w-7xl flex flex-col gap-8">
        <div className="relative flex items-center justify-between mb-8">
          <div className="absolute right-0 top-0">
            <MenuIcon options={menuOptions} chains={chains} />
          </div>
          <div className="w-full">
            <h1 className="text-4xl font-bold text-center mb-2 gradient-text">
              RRC-7755 Demo
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              A demo for sending cross-chain calls using RRC-7755
            </p>
            <div className="flex justify-center">
              <WalletConnection />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-8 animate-slide-up">
          <BalancesPanel
            sourceChainBalances={sourceChainBalances}
            destinationChainBalances={destinationChainBalances}
            sourceChain={sourceChain}
            destinationChain={destinationChain}
            handleSourceChainChange={handleSourceChainChange}
            handleDestinationChainChange={handleDestinationChainChange}
            selectedToken={selectedToken}
            toggleMintModal={toggleMintModal}
            chains={chains}
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

      <MintUSDCModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        chains={chains}
      />
    </main>
  );
}
