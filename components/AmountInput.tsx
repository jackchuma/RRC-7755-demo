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
  return (
    <div className="mb-4 w-full">
      <label htmlFor="amount" className="block text-sm font-medium mb-2">
        Amount to Send (Max: {maxAmount.toLocaleString()})
      </label>
      <div className="w-full h-10 rounded-md overflow-hidden">
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={maxAmount}
          step="0.000001"
          className={`text-black w-full h-full px-2 ${
            disabled ? "bg-gray-500" : "bg-white"
          }`}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
