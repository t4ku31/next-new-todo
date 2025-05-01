import "iron-session";
import { UserSession } from "./session";

declare module "iron-session" {
  interface IronSessionData {
    user?: UserSession;
  }
}