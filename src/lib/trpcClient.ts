// src/lib/trpcClient.ts
import { createTRPCReact } from '@trpc/react-query';
import type { appRouter }  from '@/server/trpc/index';
import {
  splitLink,
  httpBatchLink,
  wsLink,
  createWSClient,
} from '@trpc/client';
import superjson from 'superjson';
//appRouter内のルーターを型として渡す
export const trpc = createTRPCReact<typeof appRouter>();

export function createTRPCClient() {
    
    const wsClient = createWSClient({
    url:
      (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000')
        .replace(/^http/, 'ws') + '/api/trpc',
    });

  return trpc.createClient({
    //superjsonを使用してデータをやり取りする(同じ型を使用するため)
   
    //通信経路を定義
    links: [
    //通信経路を分岐
      splitLink({
        //通信経路を分岐する条件
        condition(op) {
          console.log("condition", op);
          return op.type === 'subscription';
        },
        // subscription は WebSocket 経由。transformer もここで指定
        true: wsLink({ client: wsClient, transformer: superjson }),

        // query/mutation は HTTP batch。transformer もここで指定
        //クエリをまとめて送信できる(httpBatchLink)
        false: httpBatchLink({ 
          url: '/api/trpc',//送り先
          fetch: (input,init) => {
            //「サーバーの Set-Cookie を受け取り」「以降のリクエストに Cookie を自動送信」させる
            return fetch(input,{...init,credentials:'include'})
          },
      
          transformer: superjson 
        }),
      }),
    ],
  });
}
