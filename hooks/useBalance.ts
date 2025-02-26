import { getBalance } from "@/app/lib/getBalance";
import { Balance } from "@/utils/types/balance";
import { TokenType } from "@/utils/types/tokenType";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

interface UseBalanceProps {
  chainId: number;
}

export default function useBalance(props: UseBalanceProps) {
  const { address } = useAccount();

  const [balance, setBalance] = useState<Balance>({
    [TokenType.ETH]: 0,
    [TokenType.USDC]: 0,
  });

  useEffect(() => {
    if (!address) return;

    const intervalId = setInterval(() => {
      getBalance(address, props.chainId).then((res) => {
        setBalance(res.data.balance);
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [address, props.chainId]);

  return balance;
}
