import { AlertTriangle } from "lucide-react";
import { SelectionItem } from "@/utils/types/selectionItem";

interface ETHWarningBannerProps {
  sourceChain: SelectionItem;
  destinationChain: SelectionItem;
  sourceChainHasETH: boolean;
  destinationChainHasETH: boolean;
  onClose: () => void;
}

export default function ETHWarningBanner({
  sourceChain,
  destinationChain,
  sourceChainHasETH,
  destinationChainHasETH,
  onClose,
}: ETHWarningBannerProps) {
  // Determine which chains need ETH
  const needsSourceETH = !sourceChainHasETH;
  const needsDestinationETH = !destinationChainHasETH;

  // Create message based on which chains need ETH
  let message = "";
  if (needsSourceETH && needsDestinationETH) {
    message = `You need testnet ETH on both ${sourceChain.name} and ${destinationChain.name} to use this application.`;
  } else if (needsSourceETH) {
    message = `You need testnet ETH on ${sourceChain.name} to use this application.`;
  } else if (needsDestinationETH) {
    message = `You need testnet ETH on ${destinationChain.name} to use this application.`;
  }

  return (
    <div className="w-full max-w-5xl mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-medium">ETH Required</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="mt-2">
            <a
              href="https://www.alchemy.com/faucets/optimism-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mr-4"
            >
              Get Optimism Sepolia ETH
            </a>
            <a
              href="https://www.alchemy.com/faucets/arbitrum-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mr-4"
            >
              Get Arbitrum Sepolia ETH
            </a>
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Get Base Sepolia ETH
            </a>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 text-muted-foreground hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}
