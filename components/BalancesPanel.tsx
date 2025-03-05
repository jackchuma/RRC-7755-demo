"use client";

import { SelectionItem } from "@/utils/types/selectionItem";
import Selector from "./Selector";
import { Balances } from "@/app/lib/getBalances";
import { TokenType } from "@/utils/types/tokenType";

interface BalancesPanelProps {
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  sourceChainBalances: Balances;
  destinationChainBalances: Balances;
  handleSourceChainChange: (chainId: number) => void;
  handleDestinationChainChange: (chainId: number) => void;
  selectedToken: TokenType;
  toggleMintModal: (open: boolean) => void;
  chains: SelectionItem[];
}

export default function BalancesPanel({
  sourceChain,
  destinationChain,
  sourceChainBalances,
  destinationChainBalances,
  handleSourceChainChange,
  handleDestinationChainChange,
  selectedToken,
  toggleMintModal,
  chains,
}: BalancesPanelProps) {
  return (
    <div className="w-full bg-card/40 border border-border/30 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Balances</h2>
        {selectedToken === TokenType.USDC && (
          <button
            onClick={() => toggleMintModal(true)}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            Mint USDC
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Source Chain</h3>
            <Selector
              items={chains}
              selected={sourceChain}
              onChange={handleSourceChainChange}
              label=""
              displayIcon={true}
              disabled={false}
            />
          </div>
          <div className="space-y-2">
            <BalanceItem
              label="Account"
              value={sourceChainBalances.account}
              colorClass="bg-blue-500/10 text-blue-500"
            />
            <BalanceItem
              label="Fulfiller"
              value={sourceChainBalances.fulfiller}
              colorClass="bg-purple-500/10 text-purple-500"
            />
            <BalanceItem
              label="Outbox"
              value={sourceChainBalances.outbox}
              colorClass="bg-green-500/10 text-green-500"
            />
            <BalanceItem
              label="Paymaster"
              value={sourceChainBalances.paymaster}
              colorClass="bg-orange-500/10 text-orange-500"
            />
            <BalanceItem
              label="EntryPoint"
              value={sourceChainBalances.entryPoint}
              colorClass="bg-red-500/10 text-red-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Destination Chain</h3>
            <Selector
              items={chains}
              selected={destinationChain}
              onChange={handleDestinationChainChange}
              label=""
              displayIcon={true}
              disabled={false}
            />
          </div>
          <div className="space-y-2">
            <BalanceItem
              label="Account"
              value={destinationChainBalances.account}
              colorClass="bg-blue-500/10 text-blue-500"
            />
            <BalanceItem
              label="Fulfiller"
              value={destinationChainBalances.fulfiller}
              colorClass="bg-purple-500/10 text-purple-500"
            />
            <BalanceItem
              label="Outbox"
              value={destinationChainBalances.outbox}
              colorClass="bg-green-500/10 text-green-500"
            />
            <BalanceItem
              label="Paymaster"
              value={destinationChainBalances.paymaster}
              colorClass="bg-orange-500/10 text-orange-500"
            />
            <BalanceItem
              label="EntryPoint"
              value={destinationChainBalances.entryPoint}
              colorClass="bg-red-500/10 text-red-500"
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
  colorClass: string;
}

function BalanceItem({ label, value, colorClass }: BalanceItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${colorClass}`}>
        {Number(value.toFixed(4)).toLocaleString(undefined, {
          minimumFractionDigits: 4,
        })}
      </span>
    </div>
  );
}
