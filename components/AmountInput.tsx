interface AmountInputProps {
  amount: string;
  onAmountChange: (value: string) => void;
  maxAmount: number;
}

export default function AmountInput({
  amount,
  onAmountChange,
  maxAmount,
}: AmountInputProps) {
  return (
    <div className="mb-4 w-full">
      <label htmlFor="amount" className="block text-sm font-medium mb-2">
        Amount to Send (Max: {maxAmount})
      </label>
      <div className="w-full h-10 rounded-md overflow-hidden">
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={maxAmount.toString()}
          step="0.000001"
          className="text-black w-full h-full px-2"
        />
      </div>
    </div>
  );
}
