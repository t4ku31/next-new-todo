import { SessionOptions } from "iron-session";

export interface UserSession {
  id: number;
  email: string;
  username: string;
}

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be set and at least 32 characters");
}

export const sessionOptions: SessionOptions = {
  
  password:  process.env.SESSION_SECRET,
  cookieName: "todo-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}; 