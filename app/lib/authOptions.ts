import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthMethod, AuthService } from "@/app/services/auth/authService";
import type { AuthOptions } from "next-auth";
import { decode as decodeJwt } from "next-auth/jwt";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.GITHUB_SECRET;

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo admin:org",
        },
      },
    }),

    CredentialsProvider({
      id: "github-pat",
      name: "GitHub Personal Access Token",
      credentials: {
        token: { label: "Personal Access Token", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        try {
          const result = await AuthService.validatePersonalAccessToken(credentials.token);

          return {
            id: result.user.id.toString(),
            name: result.user.name || result.user.login,
            email: result.user.email,
            image: result.user.avatar_url,
            accessToken: credentials.token,
            authMethod: AuthMethod.PERSONAL_ACCESS_TOKEN,
          };
        } catch (error) {
          console.error("PAT authorization error:", error);
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "github-app",
      name: "GitHub App",
      credentials: {
        appId: { label: "App ID", type: "text" },
        privateKey: { label: "Private Key", type: "text" },
        installationId: { label: "Installation ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.appId || !credentials?.privateKey || !credentials?.installationId) {
          return null;
        }

        try {
          const _result = await AuthService.validateGitHubApp(
            credentials.appId,
            credentials.privateKey,
            credentials.installationId
          );

          return {
            id: "github-app",
            name: "GitHub App",
            email: null,
            image: null,
            accessToken: "placeholder_token",
            appId: credentials.appId,
            installationId: credentials.installationId,
            authMethod: AuthMethod.GITHUB_APP,
          };
        } catch (error) {
          console.error("GitHub App authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.provider === "github") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.authMethod = AuthMethod.OAUTH;
      }

      if (user && "authMethod" in user) {
        token.accessToken = user.accessToken;
        token.authMethod = user.authMethod;

        if (user.authMethod === AuthMethod.GITHUB_APP) {
          token.appId = user.appId;
          token.installationId = user.installationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.authMethod = token.authMethod;

      if (token.authMethod === AuthMethod.GITHUB_APP) {
        session.appId = token.appId;
        session.installationId = token.installationId;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    async decode(params) {
      try {
        return await decodeJwt(params);
      } catch (error) {
        if (error instanceof Error && error.name === "JWEDecryptionFailed") {
          return null;
        }
        throw error;
      }
    },
  },
  secret: authSecret,
};
