import type { NextApiRequest,NextApiResponse} from "next";
import { getIronSession } from "iron-session";
import type {IronSession} from "iron-session";
import { sessionOptions,UserSession} from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function createContext({
  req,
  res,
}:{
  req:NextApiRequest;
  res:NextApiResponse;
}){
  const session = await getIronSession(req, res, sessionOptions);

    return {req,res,session,prisma};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
