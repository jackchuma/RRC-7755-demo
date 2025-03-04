interface AmountInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
  maxAmount: number;
  disabled: boolean;
}

export default function AmountInput({
  amount,
  onAmountChange,
  maxAmount,
  disabled,
}: AmountInputProps) {
  const handleSetMax = () => {
    if (!disabled) {
      onAmountChange(maxAmount.toString());
    }
  };

  return (
    <div className="mb-4 w-full space-y-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-muted-foreground"
        >
          Amount to Send
        </label>
        <div className="text-xs text-muted-foreground">
          Max:{" "}
          <span className="text-foreground">{maxAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={maxAmount}
          step="0.000001"
          className={`w-full h-10 px-3 py-2 bg-card/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all ${
            disabled ? "opacity-60 cursor-not-allowed" : "hover:border-border"
          }`}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={handleSetMax}
          disabled={disabled}
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded bg-primary/20 text-primary-foreground transition-all ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/30 active:scale-95"
          }`}
        >
          MAX
        </button>
      </div>
    </div>
  );
}
