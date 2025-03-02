"use client";

import {
  arbitrumSepolia,
  base,
  baseSepolia,
  optimismSepolia,
} from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { useState, type ReactNode } from "react";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http,
  State,
  WagmiProvider,
} from "wagmi";
import { coinbaseWallet } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig({
  chains: [base, arbitrumSepolia, baseSepolia, optimismSepolia],
  connectors: [
    coinbaseWallet({
      appName: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      preference: process.env.NEXT_PUBLIC_ONCHAINKIT_WALLET_CONFIG as
        | "smartWalletOnly"
        | "all",
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [arbitrumSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

export function Providers(props: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={optimismSepolia}
          config={{
            appearance: {
              mode: "auto",
            },
          }}
        >
          {props.children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
