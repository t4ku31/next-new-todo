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
          return op.type === 'subscription';
        },
        // subscription は WebSocket 経由。transformer もここで指定
        true: wsLink({ client: wsClient, transformer: superjson }),

        // query/mutation は HTTP batch。transformer もここで指定
        false: httpBatchLink({ url: '/api/trpc', transformer: superjson }),
      }),
    ],
  });
}

/*
condition(op)の "op" の中身
interface Operation<TInput = unknown> {

   'query' | 'mutation' | 'subscription' 
  type: OperationType;

  ルーター上のメソッド名 ('user.getById' など)
  path: string;

   クライアントが渡したパラメータ 
  input: TInput;

   WebSocket 用に一意になる ID（sub のときだけ）
  id?: number;

   内部用コンテキスト（SSR 時など） 
  context?: any;

*/