interface AddressInputProps {
  destinationAddress: string;
  onDestinationAddressChange: (value: string) => void;
  disabled: boolean;
}

export default function AddressInput({
  destinationAddress,
  onDestinationAddressChange,
  disabled,
}: AddressInputProps) {
  return (
    <div className="mb-4 w-full">
      <label
        htmlFor="destination-address"
        className="block text-sm font-medium mb-2"
      >
        Destination Address
      </label>
      <div className="w-full h-10 rounded-md overflow-hidden">
        <input
          type="text"
          id="destination-address"
          value={destinationAddress}
          onChange={(e) => onDestinationAddressChange(e.target.value)}
          placeholder="Enter destination address"
          className={`text-black w-full h-full px-2 ${
            disabled ? "bg-gray-500" : "bg-white"
          }`}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
