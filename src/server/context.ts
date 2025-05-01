// src/server/context.ts
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getIronSession }                  from "iron-session";
import type { UserSession }               from "@/lib/session";
import { sessionOptions }                  from "@/lib/session";
import { prisma }                          from "@/lib/prisma";

export type Context = {
  req:        Request;
  resHeaders: Headers;
  session:    IronSession<{ user?: UserSession }>;
  prisma:     typeof prisma;
};

export async function createContext(
  opts: FetchCreateContextFnOptions
): Promise<Context> {                      // ← ここで戻り型を明示
  const { req, resHeaders } = opts;

  // shim を使って iron-session を動かす例
  const cookie = req.headers.get("cookie") ?? "";
  const resShim = {
    getHeader: (k: string) => resHeaders.get(k) ?? "",
    setHeader: (k: string, v: string) => resHeaders.set(k, v),
  } as any;

  const session = await getIronSession<{ user?: UserSession }>(
    req as any,
    resShim,
    sessionOptions
  );

  return { req, resHeaders, session, prisma };
}
