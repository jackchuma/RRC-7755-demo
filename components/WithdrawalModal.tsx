import { Call } from "@/utils/types/call";
import { SelectionItem } from "@/utils/types/selectionItem";
import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Selector from "./Selector";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  chains: SelectionItem[];
  initialChainId: number;
  onChainChange: (chainId: number) => void;
  onWithdraw: () => void;
  calls: Call[];
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  title,
  amount,
  chains,
  initialChainId,
  onChainChange,
  onWithdraw,
  calls,
}: WithdrawalModalProps) {
  const [selectedChain, setSelectedChain] = useState<SelectionItem>(
    chains.find((chain) => chain.id === initialChainId) || chains[0]
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle chain selection
  const handleChainChange = (chainId: number) => {
    const newChain = chains.find((chain) => chain.id === chainId);
    if (newChain) {
      setSelectedChain(newChain);
      onChainChange(chainId);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-indigo-800 to-purple-900 rounded-lg shadow-xl w-full max-w-md mx-4 border border-indigo-500/30 backdrop-blur-sm animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-500/30">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 mb-2">Available to withdraw:</p>
            <p className="text-2xl font-bold text-white">
              {amount.toFixed(6)} ETH
            </p>
          </div>

          <div className="mb-6">
            <Selector
              items={chains}
              selected={selectedChain}
              onChange={handleChainChange}
              label="Select Chain"
              displayIcon={true}
              disabled={false}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 mr-2 rounded-md text-white bg-transparent hover:bg-indigo-600/30 transition-colors"
            >
              Cancel
            </button>

            <Transaction
              chainId={selectedChain.id}
              calls={calls}
              onSuccess={onWithdraw}
            >
              <TransactionButton
                className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                text="Withdraw"
                disabled={amount <= 0}
              />
            </Transaction>
          </div>
        </div>
      </div>
    </div>
  );
}
