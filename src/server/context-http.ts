import type { NextApiRequest,NextApiResponse} from "next";
import { getIronSession } from "iron-session";
import { UserSession } from "@/lib/session";
import { sessionOptions} from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createContext({
  req,
  res,
}:{
  req:NextApiRequest;
  res:NextApiResponse;
}){
  const session = await getIronSession<{ user?: UserSession }>(
    req, 
    res,
    sessionOptions
  );
  console.log(session);
  
  return {req,res,session,prisma};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
