import './grobals.css';
import './styles/fullcalendar.css';
import { QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {trpc} from '@/lib/trpc';
import { httpBatchLink } from '@trpc/client';

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head />
      <body>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </trpc.Provider>
      </body>
     </html>
   );
 }