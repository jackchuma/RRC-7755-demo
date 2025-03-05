import { useState } from "react";
import { useAccount } from "wagmi";
import { chains } from "@/app/page";
import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { usdcAddress } from "@/config/tokens";
import { encodeFunctionData, parseEther } from "viem";
import MockToken from "@/abis/MockToken";

interface MintUSDCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MintUSDCModal({ isOpen, onClose }: MintUSDCModalProps) {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [amount, setAmount] = useState("100");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const calls = [];

  if (address && amount) {
    calls.push({
      to: usdcAddress,
      data: encodeFunctionData({
        abi: MockToken,
        functionName: "mint",
        args: [address, parseEther(amount)],
      }),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border/30 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Mint USDC</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Chain
            </label>
            <select
              className="w-full p-2 bg-card/40 border border-border/30 rounded-lg"
              value={selectedChain.id}
              onChange={(e) => {
                const chain = chains.find(
                  (c) => c.id === Number(e.target.value)
                );
                if (chain) setSelectedChain(chain);
              }}
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.icon} {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 bg-card/40 border border-border/30 rounded-lg"
              placeholder="Enter amount"
              min="1"
            />
          </div>

          {error && (
            <div className="p-2 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <Transaction
            chainId={selectedChain.id}
            calls={calls}
            onSuccess={onClose}
            onError={(err) => setError(err.message)}
          >
            <TransactionButton
              className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              text="Mint USDC"
              disabled={calls.length === 0 || !address}
            />
          </Transaction>

          <p className="text-xs text-muted-foreground text-center">
            This will mint test USDC tokens to your wallet on the selected
            chain.
          </p>
        </div>
      </div>
    </div>
  );
}
