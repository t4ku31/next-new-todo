// src/server/context.ts
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getIronSession, IronSession } from "iron-session";
import type { UserSession }               from "@/lib/session";
import { sessionOptions }                  from "@/lib/session";
import { prisma }                          from "@/lib/prisma";


// ---コンテキストの型定義 ---
export type Context = {
  req:        Request;
  resHeaders: Headers;
  session:    IronSession<{ user?: UserSession }>;
  prisma:     typeof prisma;
};

export async function createContext(
  opts:FetchCreateContextFnOptions
): Promise<Context> {            // ← ここで戻り型を明示

  const { req, resHeaders } = opts;


  //クライアントに返すヘッダーをためる
  const headerStore = new Headers();

  // headerStoreを使って、headersを操作するためのshim
  const resShim = {
    //headerStoreからcookieを取得
    getHeader: (key: string) => headerStore.get(key) ?? "",
    //headerStoreにcookieをセット
    setHeader: (key: string, val: string) => headerStore.set(key, val),
  } as any;
  
  await getIronSession(req as any, resShim, sessionOptions); 

  const session = await getIronSession<{ user?: UserSession }>(
    req as any,
    resShim,
    sessionOptions
  );

  return { req, resHeaders, session, prisma};
}

