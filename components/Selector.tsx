import { SelectionItem } from "@/utils/types/selectionItem";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChainSelectorProps {
  items: SelectionItem[];
  selected: SelectionItem;
  onChange: (id: number) => void;
  label: string;
  displayIcon: boolean;
  disabled: boolean;
}

export default function Selector({
  items,
  selected,
  onChange,
  label,
  displayIcon,
  disabled,
}: ChainSelectorProps) {
  const [displayDropdown, setDisplayDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleOpenDisplay = () => {
    if (disabled) return;
    setDisplayDropdown(!displayDropdown);
  };

  const handleSelection = (id: number) => {
    setDisplayDropdown(false);
    onChange(id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDisplayDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium mb-2 text-muted-foreground">
        {label}
      </label>
      <div
        className={`w-full h-10 bg-card/50 border border-border/50 rounded-lg flex items-center justify-between px-3 transition-all ${
          disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:border-border"
        }`}
        onClick={handleOpenDisplay}
      >
        <div className="flex items-center gap-2 text-foreground">
          {displayIcon && <span className="text-lg">{selected.icon}</span>}
          <span>{selected.name}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            displayDropdown ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {displayDropdown && (
        <div className="absolute w-full mt-1 z-20 animate-fade-in">
          <div className="bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${
                  item.id === selected.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-card/80 text-foreground"
                }`}
                onClick={() => handleSelection(item.id)}
              >
                <div className="w-6 flex items-center justify-center">
                  {item.id === selected.id && <Check className="h-4 w-4" />}
                </div>
                {displayIcon && (
                  <span className="mr-2 text-lg">{item.icon}</span>
                )}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
