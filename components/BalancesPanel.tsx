"use client";

import { SelectionItem } from "@/utils/types/selectionItem";
import Selector from "./Selector";
import { Balances } from "@/app/lib/getBalances";
import { Token, TokenType } from "@/utils/types/tokenType";
import { Coins, TrendingUp } from "lucide-react";

interface BalancesPanelProps {
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  sourceChainBalances: Balances;
  destinationChainBalances: Balances;
  handleSourceChainChange: (chainId: number) => void;
  handleDestinationChainChange: (chainId: number) => void;
  selectedToken: Token;
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
    <div className="w-full bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-5 shadow-md">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary/80" />
          <h2 className="text-lg font-semibold">Balances</h2>
        </div>
        {selectedToken.id === TokenType.USDC && (
          <button
            onClick={() => toggleMintModal(true)}
            className="text-xs px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors flex items-center gap-1.5 font-medium shadow-sm"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Mint USDC
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Chain Selectors */}
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium">Source</h3>
            </div>
            <Selector
              items={chains}
              selected={sourceChain}
              onChange={handleSourceChainChange}
              label=""
              displayIcon={true}
              disabled={false}
              disabledItems={[destinationChain.id]}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Destination</h3>
            </div>
            <Selector
              items={chains}
              selected={destinationChain}
              onChange={handleDestinationChainChange}
              label=""
              displayIcon={true}
              disabled={false}
              disabledItems={[sourceChain.id]}
            />
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BalanceCard
          balances={sourceChainBalances}
          token={selectedToken.icon}
        />

        <BalanceCard
          balances={destinationChainBalances}
          token={selectedToken.icon}
        />
      </div>
    </div>
  );
}

interface BalanceCardProps {
  balances: Balances;
  token: string;
}

function BalanceCard({ balances, token }: BalanceCardProps) {
  return (
    <div className="bg-card/60 border border-border/40 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
      <div className="grid grid-cols-2 gap-2">
        <BalanceItem
          label="Account"
          value={balances.account}
          colorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
          token={token}
        />
        <BalanceItem
          label="Fulfiller"
          value={balances.fulfiller}
          colorClass="bg-purple-500/10 text-purple-500 border-purple-500/20"
          token={token}
        />
        <BalanceItem
          label="Outbox"
          value={balances.outbox}
          colorClass="bg-green-500/10 text-green-500 border-green-500/20"
          token={token}
        />
        <BalanceItem
          label="Paymaster"
          value={balances.paymaster}
          colorClass="bg-orange-500/10 text-orange-500 border-orange-500/20"
          token={token}
        />
        <BalanceItem
          label="EntryPoint"
          value={balances.entryPoint}
          colorClass="bg-red-500/10 text-red-500 border-red-500/20"
          token="ETH"
        />
      </div>
    </div>
  );
}

interface BalanceItemProps {
  label: string;
  value: number;
  colorClass: string;
  token: string;
}

function BalanceItem({ label, value, colorClass, token }: BalanceItemProps) {
  return (
    <div className={`flex flex-col p-2 rounded-md border ${colorClass}`}>
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <span className="text-sm font-medium">
        {Number(value.toFixed(4)).toLocaleString(undefined, {
          minimumFractionDigits: 4,
        })}{" "}
        {token}
      </span>
    </div>
  );
}
