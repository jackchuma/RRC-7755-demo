import { SelectionItem } from "@/utils/types/selectionItem";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ChainSelectorProps {
  items: SelectionItem[];
  selected: SelectionItem;
  onChange: (id: number) => void;
  label: string;
  displayIcon: boolean;
}

export default function Selector({
  items,
  selected,
  onChange,
  label,
  displayIcon,
}: ChainSelectorProps) {
  const [displayDropdown, setDisplayDropdown] = useState(false);

  const handleSelection = (id: number) => {
    setDisplayDropdown(false);
    onChange(id);
  };

  return (
    <>
      {displayDropdown && (
        <div
          className="absolute inset-0 bg-black opacity-50 z-10"
          onClick={() => setDisplayDropdown(false)}
        />
      )}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div
          className="border w-full h-10 bg-white rounded-md flex items-center justify-between px-4 cursor-pointer"
          onClick={() => setDisplayDropdown(true)}
        >
          <div className="w-full text-black">
            {displayIcon && selected.icon} {selected.name}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 text-black" />
        </div>
        {displayDropdown && (
          <>
            <div className="bg-white rounded-md text-black absolute w-full mt-1 overflow-hidden z-20">
              {items.map((item) => (
                <div key={item.id}>
                  <div
                    className="flex items-center cursor-pointer px-1 py-1 hover:bg-gray-100"
                    onClick={() => handleSelection(item.id)}
                  >
                    <div className="w-6 flex items-center justify-center h-full">
                      {item.id === selected.id && (
                        <Check className="h-4 w-4 text-black" />
                      )}
                    </div>
                    {displayIcon && <span className="mr-2">{item.icon}</span>}
                    {item.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
