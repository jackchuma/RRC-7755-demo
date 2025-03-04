import { Balances, getBalances } from "@/app/lib/getBalances";
import { Token } from "@/utils/types/tokenType";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function useBalance(chainId: number, token: Token) {
  const { address } = useAccount();

  const [balance, setBalance] = useState<Balances>({
    account: 0,
    fulfiller: 0,
    outbox: 0,
    paymaster: 0,
    entryPoint: 0,
  });

  useEffect(() => {
    if (!address) return;

    getBalances(chainId, token, address).then((res) => {
      setBalance(res.data.balances);
    });

    const intervalId = setInterval(() => {
      getBalances(chainId, token, address).then((res) => {
        setBalance(res.data.balances);
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [address, chainId, token.id]);

  return balance;
}
