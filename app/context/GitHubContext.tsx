"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GitHubService } from "../services/github/githubService";
import { GitHubGraphQLService } from "../services/github/graphqlService";
import { AuthCredentials, AuthMethod } from "../services/auth/authService";

interface GitHubContextType {
  githubService: GitHubService | null;
  graphqlService: GitHubGraphQLService | null;
  isLoading: boolean;
  authMethod: AuthMethod | null;
}

const GitHubContext = createContext<GitHubContextType>({
  githubService: null,
  graphqlService: null,
  isLoading: true,
  authMethod: null,
});

export function useGitHub() {
  return useContext(GitHubContext);
}

interface GitHubProviderProps {
  children: ReactNode;
}

export function GitHubProvider({ children }: GitHubProviderProps) {
  const { data: session, status } = useSession();
  const [githubService, setGithubService] = useState<GitHubService | null>(null);
  const [graphqlService, setGraphQLService] = useState<GitHubGraphQLService | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Create GitHub service based on authentication method
      if (session.accessToken) {
        let service: GitHubService;
        const accessToken = session.accessToken as string;

        // Check if we have additional auth method information
        if (session.authMethod) {
          const credentials: AuthCredentials = {
            method: session.authMethod as AuthMethod,
            token: accessToken,
          };

          // Add GitHub App specific credentials if available
          if (session.authMethod === AuthMethod.GITHUB_APP && session.appId && session.installationId) {
            credentials.appId = session.appId as string;
            credentials.installationId = session.installationId as string;
          }

          service = new GitHubService(credentials);
        } else {
          // Legacy OAuth flow
          service = new GitHubService(accessToken);
        }

        setGithubService(service);
        setAuthMethod(service.getAuthMethod());

        // Create GraphQL service with the same token
        setGraphQLService(new GitHubGraphQLService(accessToken));
      }

      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setGithubService(null);
      setGraphQLService(null);
      setAuthMethod(null);
      setIsLoading(false);
    }
  }, [session, status]);

  return (
    <GitHubContext.Provider value={{ githubService, graphqlService, isLoading, authMethod }}>
      {children}
    </GitHubContext.Provider>
  );
}
