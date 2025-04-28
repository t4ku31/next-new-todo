import { SessionOptions } from "iron-session";

export interface UserSession {
  id: number;
  email: string;
  username: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "your-secret-key",
  cookieName: "todo-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}; 