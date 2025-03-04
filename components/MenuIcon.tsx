import { Call } from "@/utils/types/call";
import {
  Transaction,
  TransactionButton,
} from "@coinbase/onchainkit/transaction";
import { useState, useEffect, useRef } from "react";

interface MenuOption {
  label: string;
  action: () => void;
  calls: () => Promise<Call[]>;
  chainId: number;
}

interface MenuIconProps {
  options: MenuOption[];
}

const MenuIcon: React.FC<MenuIconProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Function to handle clicks outside the menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="absolute top-0 left-0 z-50" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
        aria-label="Menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 left-0 w-48 bg-gradient-to-br from-indigo-800 to-purple-900 rounded-md shadow-xl py-1 mt-2 border border-indigo-500/30 backdrop-blur-sm">
          {options.map((option, index) =>
            option.chainId !== 0 ? (
              <Transaction
                chainId={option.chainId}
                calls={option.calls}
                onSuccess={() => setIsOpen(false)}
              >
                <TransactionButton
                  className="block w-full px-4 py-2 text-sm hover:bg-indigo-600/50 transition-colors bg-inherit border-none rounded-none [&>div]:justify-start [&>div]:text-white [&>div]:font-normal"
                  text={option.label}
                />
              </Transaction>
            ) : (
              <button
                key={index}
                onClick={() => {
                  option.action();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-indigo-600/50 transition-colors"
              >
                {option.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MenuIcon;
