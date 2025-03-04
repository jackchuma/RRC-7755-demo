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
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center gradient-text">
        System Balances
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Chain Balances */}
        <div className="bg-card/30 border border-border/30 rounded-xl p-5 transition-all hover:border-border/50">
          <div className="mb-4">
            <Selector
              items={chains}
              selected={sourceChain}
              onChange={handleSourceChainChange}
              label="Source Chain"
              displayIcon={true}
              disabled={currentStep > 0}
            />
          </div>

          <div className="space-y-3">
            <BalanceItem
              label="Account"
              value={sourceBalances.account}
              token={token}
              colorClass="text-emerald-400"
            />

            <BalanceItem
              label="Fulfiller"
              value={sourceBalances.fulfiller}
              token={token}
              colorClass="text-amber-400"
            />

            <BalanceItem
              label="Outbox"
              value={sourceBalances.outbox}
              token={token}
              colorClass="text-purple-400"
            />
          </div>
        </div>

        {/* Destination Chain Balances */}
        <div className="bg-card/30 border border-border/30 rounded-xl p-5 transition-all hover:border-border/50">
          <div className="mb-4">
            <Selector
              items={chains}
              selected={destinationChain}
              onChange={handleDestinationChainChange}
              label="Destination Chain"
              displayIcon={true}
              disabled={currentStep > 0}
            />
          </div>

          <div className="space-y-3">
            <BalanceItem
              label="Account"
              value={destinationBalances.account}
              token={token}
              colorClass="text-emerald-400"
            />

            <BalanceItem
              label="Fulfiller"
              value={destinationBalances.fulfiller}
              token={token}
              colorClass="text-amber-400"
            />

            <BalanceItem
              label="Paymaster"
              value={destinationBalances.paymaster}
              token={token}
              colorClass="text-blue-400"
            />

            <BalanceItem
              label="Entry Point"
              value={destinationBalances.entryPoint}
              token={token}
              colorClass="text-rose-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface BalanceItemProps {
  label: string;
  value: number;
  token: Token;
  colorClass: string;
}

function BalanceItem({ label, value, token, colorClass }: BalanceItemProps) {
  return (
    <div className="bg-card/40 rounded-lg p-3 transition-all hover:bg-card/60">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">{label}:</span>
        <span className={`font-medium ${colorClass} flex items-center gap-1`}>
          {value} <span className="text-lg">{token.icon}</span>
        </span>
      </div>
    </div>
  );
}
