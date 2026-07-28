import { DefaultSession } from "next-auth";
import { AuthMethod } from "@/app/services/auth/authService";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    authMethod?: AuthMethod;
    appId?: string;
    installationId?: string;
    user?: DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    authMethod?: AuthMethod;
    appId?: string;
    installationId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    authMethod?: AuthMethod;
    appId?: string;
    installationId?: string;
  }
}
