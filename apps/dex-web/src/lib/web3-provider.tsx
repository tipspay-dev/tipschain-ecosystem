import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { TIPSCHAIN } from '../constants/tokens';
import { ReactNode } from 'react';

const config = createConfig({
  chains: [TIPSCHAIN],
  connectors: [injected()],
  transports: {
    [TIPSCHAIN.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
