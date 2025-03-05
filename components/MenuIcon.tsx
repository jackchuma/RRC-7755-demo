import { useState, useEffect, useRef } from "react";
import WithdrawalModal from "./WithdrawalModal";
import { WithdrawCallResponse } from "@/app/lib/buildWithdrawMagicSpendCall";
import { Call } from "@/utils/types/call";
import { SelectionItem } from "@/utils/types/selectionItem";

interface MenuOption {
  label: string;
  action: () => void;
  calls: (chainId: number) => Promise<WithdrawCallResponse>;
  chainId: number;
}

interface MenuIconProps {
  options: MenuOption[];
  chains: SelectionItem[];
}

const MenuIcon: React.FC<MenuIconProps> = ({ options, chains }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<MenuOption | null>(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [selectedChainId, setSelectedChainId] = useState(0);
  const [calls, setCalls] = useState<Call[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = async (option: MenuOption) => {
    // If it's a reset option (chainId === 0), just execute the action
    if (option.chainId === 0) {
      option.action();
      setIsOpen(false);
      return;
    }

    try {
      // For withdrawal options, open the modal
      setSelectedOption(option);
      setSelectedChainId(option.chainId);

      // Set initial amount to 0
      setWithdrawalAmount(0);

      // Open the modal
      setIsModalOpen(true);
      setIsOpen(false);

      // Fetch the amount asynchronously
      fetchWithdrawalAmount(option, option.chainId);
    } catch (error) {
      console.error("Error handling option click:", error);
    }
  };

  const fetchWithdrawalAmount = async (option: MenuOption, chainId: number) => {
    try {
      const res = await option.calls(chainId);

      setWithdrawalAmount(res.data.amount);
      setCalls(res.data.calls);
    } catch (error) {
      console.error("Error fetching withdrawal amount:", error);
    }
  };

  const handleChainChange = (chainId: number) => {
    setSelectedChainId(chainId);

    // When the chain changes, we need to update the withdrawal amount
    if (selectedOption) {
      fetchWithdrawalAmount(selectedOption, chainId);
    }
  };

  const handleWithdrawSuccess = () => {
    setIsModalOpen(false);
    if (selectedOption) {
      selectedOption.action();
    }
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
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-indigo-600/50 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Withdrawal Modal */}
      {selectedOption && (
        <WithdrawalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedOption.label}
          amount={withdrawalAmount}
          chains={chains}
          selectedChain={selectedChainId}
          onChainChange={handleChainChange}
          onWithdraw={handleWithdrawSuccess}
          calls={calls}
        />
      )}
    </div>
  );
};

export default MenuIcon;
