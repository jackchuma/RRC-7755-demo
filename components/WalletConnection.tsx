import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownLink,
} from "@coinbase/onchainkit/wallet";

export default function WalletConnection() {
  return (
    <Wallet>
      <ConnectWallet className="flex items-center gap-2 px-4 py-2 bg-card/40 border border-border/30 rounded-lg hover:bg-card/60 transition-all shadow-sm">
        <Avatar className="h-6 w-6 rounded-full" />
        <Name className="font-medium" />
      </ConnectWallet>
      <WalletDropdown className="bg-card border border-border/30 rounded-lg shadow-lg overflow-hidden animate-fade-in">
        <Identity
          className="px-5 py-4 border-b border-border/30 bg-card/50"
          hasCopyAddressOnClick
        >
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10 rounded-full" />
            <div>
              <Name className="font-medium text-lg" />
              <Address className="text-xs text-muted-foreground" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border/20">
            <EthBalance className="text-sm font-medium" />
          </div>
        </Identity>
        <div className="p-1">
          <WalletDropdownLink
            icon="wallet"
            href="https://keys.coinbase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors text-sm"
          >
            Wallet
          </WalletDropdownLink>
          <WalletDropdownDisconnect className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors text-sm w-full" />
        </div>
      </WalletDropdown>
    </Wallet>
  );
}
