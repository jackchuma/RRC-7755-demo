"use client";

import { SelectionItem } from "@/utils/types/selectionItem";
import { Token } from "@/utils/types/tokenType";
import Selector from "./Selector";
import { Balances } from "@/app/lib/getBalances";

interface BalancesPanelProps {
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  token: Token;
  sourceBalances: Balances;
  destinationBalances: Balances;
  currentStep: number;
  chains: SelectionItem[];
  handleSourceChainChange: (chainId: number) => void;
  handleDestinationChainChange: (chainId: number) => void;
}

export default function BalancesPanel({
  sourceChain,
  destinationChain,
  token,
  sourceBalances,
  destinationBalances,
  currentStep,
  chains,
  handleSourceChainChange,
  handleDestinationChainChange,
}: BalancesPanelProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full mb-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        System Balances
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Chain Balances */}
        <div className="border border-gray-700 rounded-lg p-4">
          <Selector
            items={chains}
            selected={sourceChain}
            onChange={handleSourceChainChange}
            label="Source Chain"
            displayIcon={true}
            disabled={currentStep > 0}
          />

          <div className="space-y-2">
            <div className={"p-2 rounded"}>
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="font-bold text-green-400">
                  {sourceBalances.account} {token.icon}
                </span>
              </div>
            </div>

            <div className={"p-2 rounded"}>
              <div className="flex justify-between">
                <span>Fulfiller:</span>
                <span className="font-bold text-yellow-400">
                  {sourceBalances.fulfiller} {token.icon}
                </span>
              </div>
            </div>

            <div className={"p-2 rounded"}>
              <div className="flex justify-between">
                <span>Outbox:</span>
                <span className="font-bold text-purple-400">
                  {sourceBalances.outbox} {token.icon}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destination Chain Balances */}
        <div className="border border-gray-700 rounded-lg p-4">
          <Selector
            items={chains}
            selected={destinationChain}
            onChange={handleDestinationChainChange}
            label="Destination Chain"
            displayIcon={true}
            disabled={currentStep > 0}
          />

          <div className="space-y-2">
            <div className={"p-2 rounded"}>
              <div className="flex justify-between">
                <span>Account:</span>
                <span className="font-bold text-green-400">
                  {destinationBalances.account} {token.icon}
                </span>
              </div>
            </div>

            <div className="p-2 rounded">
              <div className="flex justify-between">
                <span>Fulfiller:</span>
                <span className="font-bold text-yellow-400">
                  {destinationBalances.fulfiller} {token.icon}
                </span>
              </div>
            </div>

            <div className="p-2 rounded">
              <div className="flex justify-between">
                <span>Paymaster:</span>
                <span className="font-bold text-blue-400">
                  {destinationBalances.paymaster} {token.icon}
                </span>
              </div>
            </div>

            <div className="p-2 rounded">
              <div className="flex justify-between">
                <span>Entry Point:</span>
                <span className="font-bold text-red-400">
                  {destinationBalances.entryPoint} {token.icon}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
