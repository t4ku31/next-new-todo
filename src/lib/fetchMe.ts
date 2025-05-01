import { createInnerTRPCContext } from "@/server/context";
import { appRouter } from "@/server/trpc/index";
import { cookies } from "next/headers";

export async function fetchMe(cookieStore: ReturnType<typeof cookies>) {
  const ctx = await createInnerTRPCContext({ cookieStore });
  const caller = appRouter.createCaller(ctx);
  return caller.auth.me();
}
