// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter }            from "@/server/trpc/index";
import { createContext }        from "@/server/context";

export async function GET(request: Request) {
  return fetchRequestHandler({
    endpoint:      "/api/trpc",
    req:           request,
    router:        appRouter,
    createContext,

    // ctx は undefined の可能性があるので safe call
    responseMeta({ ctx }: { ctx: any }) {
      const cookie = ctx?.resHeaders.get("set-cookie");
      return cookie
        ? { headers: { "set-cookie": cookie } }
        : {};
    },
  });
}

export const POST = GET;  
