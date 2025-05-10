import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthMethod, AuthService } from "@/app/services/auth/authService";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
const handler = NextAuth({
  providers: [
    // GitHub OAuth Provider
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // We need to request additional scopes to access GitHub API
      authorization: {
        params: {
          scope: "read:user user:email repo admin:org",
        },
      },
    }),

    // Personal Access Token Provider
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

    // GitHub App Provider
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
          const result = await AuthService.validateGitHubApp(
            credentials.appId,
            credentials.privateKey,
            credentials.installationId
          );

          // In a real implementation, you would get user information from the GitHub App
          // For now, we'll return a placeholder user
          return {
            id: "github-app",
            name: "GitHub App",
            email: null,
            image: null,
            accessToken: "placeholder_token", // In a real implementation, this would be the installation token
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
      // Persist the OAuth access_token to the token right after signin
      if (account && account.provider === "github") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.authMethod = AuthMethod.OAUTH;
      }

      // Handle credentials providers (PAT and GitHub App)
      if (user && "authMethod" in user) {
        token.accessToken = user.accessToken;
        token.authMethod = user.authMethod;

        // For GitHub App, store additional information
        if (user.authMethod === AuthMethod.GITHUB_APP) {
          token.appId = user.appId;
          token.installationId = user.installationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider
      session.accessToken = token.accessToken;
      session.authMethod = token.authMethod;

      // For GitHub App, include additional information
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
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
