import { createContext } from "./context.server";
import { Context } from "./context.server";
import { cookies } from "next/headers";

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