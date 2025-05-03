import { createInnerContext } from "@/server/context.server";
import { appRouter }     from "@/server/trpc/index";


export async function fetchMe() {

  const ctx = await createInnerContext();
  // ⑥ tRPC call
  return appRouter.createCaller(ctx);
}
