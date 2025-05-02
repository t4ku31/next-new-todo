// src/server/context.ts
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getIronSession, IronSession } from "iron-session";
import type { UserSession }               from "@/lib/session";
import { sessionOptions }                  from "@/lib/session";
import { prisma }                          from "@/lib/prisma";
import { cookies }                         from "next/headers";
import { responseCookiesToRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
// ---コンテキストの型定義 ---
export type Context = {
  req:        Request;
  resHeaders: Headers;
  session:    IronSession<{ user?: UserSession }>;
  prisma:     typeof prisma;
};
//オプション
export type CreateContextOptions = FetchCreateContextFnOptions & {
  cookieStore: ReturnType<typeof cookies>;
};

export async function createContext(
  opts: CreateContextOptions
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

export async function createInnerContext(): Promise<Context> {
  // ① cookies() から cookieStore を取得
  const cookieStore = await cookies();
  // ② cookieStore から cookieHeader を取得
  const cookieHeader = await cookieStore
  .getAll()
  .map(c => `${c.name}=${c.value}`)
  .join("; ");
  // ③ cookieHeader付きのRequestを作る 
  const req = new Request("http://localhost",{
    headers:{cookie:cookieHeader}
  });
  // ④ 空のHeadersを作る
  const resHeaders = new Headers(); 
  // ⑤ contextを作る
  const ctx = await createContext({
    req,
    resHeaders,
    cookieStore,
  }as any);

  return ctx;
}
