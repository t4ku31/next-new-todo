'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from '@/lib/trpcClient';

const Providers = ({ children }: { children: ReactNode }) => {
  // React Query クライアント初期化
  const [queryClient] = useState(() => new QueryClient());

  // tRPC クライアント初期化
  const [trpcClient]  = useState(() => createTRPCClient())

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Providers;