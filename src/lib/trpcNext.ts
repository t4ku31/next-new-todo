import type { appRouter } from '@/server/trpc/index';   // サーバー側で export している型
import { createTRPCNext } from '@trpc/next';
import { splitLink, httpBatchLink, loggerLink, wsLink, createWSClient } from '@trpc/client';
import superjson from 'superjson';

const wsClient = createWSClient({
  url: (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')
    .replace(/^http/, 'ws') + '/api/trpc',
});

export const trpc = createTRPCNext<typeof appRouter>({
  config({ ctx }) {
    // クライアント・SSR 両対応のため url はここで必ず返す
    const url = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000') + '/api/trpc';

    return {
      url,
      transformer: superjson,
      links: [
        loggerLink(),
        splitLink({
          condition(op) {
            return op.type === 'subscription';
          },
          true:  wsLink({ client: wsClient }),
          false: httpBatchLink({ url }),
        }),
      ],
    };
  },
  ssr: false,
});
