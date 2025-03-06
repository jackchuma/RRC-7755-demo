import { Balances, getBalances } from "@/app/lib/getBalances";
import { Token } from "@/utils/types/tokenType";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

export default function useBalance(
  chainId: number,
  token: Token,
  currentStep: number
) {
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
    waitForBalanceUpdate(chainId, token, address);
  }, [address, chainId, token.id, currentStep]);

  const waitForBalanceUpdate = async (
    chainId: number,
    token: Token,
    address: Address
  ) => {
    const balanceBefore = structuredClone(balance);
    let newBalance = structuredClone(balanceBefore);
    let attempts = 0;

    while (isEqualBalance(balanceBefore, newBalance) && attempts++ < 15) {
      const res = await getBalances(chainId, token, address);
      newBalance = res.data.balances;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setBalance(newBalance);
  };

  const isEqualBalance = (balance1: Balances, balance2: Balances) => {
    return (
      balance1.account === balance2.account &&
      balance1.fulfiller === balance2.fulfiller &&
      balance1.outbox === balance2.outbox &&
      balance1.paymaster === balance2.paymaster &&
      balance1.entryPoint === balance2.entryPoint
    );
  };

  return balance;
}
