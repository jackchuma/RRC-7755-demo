import { Balance } from "@/utils/types/balance";
import { SelectionItem } from "@/utils/types/selectionItem";
import { TokenType } from "@/utils/types/tokenType";

interface ChainVisualizerProps {
  chain: SelectionItem;
  balance: Balance;
  isSource: boolean;
  currentStep: number;
}

export default function ChainVisualizer({
  chain,
  balance,
  isSource,
  currentStep,
}: ChainVisualizerProps) {
  const isActive =
    (isSource && currentStep === 0) || (!isSource && currentStep === 2);

  return (
    <div
      className={`bg-gray-800 p-6 rounded-lg shadow-lg ${
        isActive ? "ring-2 ring-blue-500" : ""
      } mb-4`}
    >
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <span className="mr-2">{chain.icon}</span>
        {chain.name}
      </h2>
      <div className="text-xl mb-2">
        ETH Balance:{" "}
        <span className="font-bold text-green-400">
          {balance[TokenType.ETH]} ETH
        </span>
      </div>
      <div className="text-xl">
        USDC Balance:{" "}
        <span className="font-bold text-green-400">
          {balance[TokenType.USDC]} USDC
        </span>
      </div>
      {isActive && (
        <div className="mt-4 text-blue-400">
          {isSource ? "Sending transaction..." : "Receiving transaction..."}
        </div>
      )}
    </div>
  );
}
