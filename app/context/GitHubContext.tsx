"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GitHubService } from "../services/github/githubService";
import { GitHubGraphQLService } from "../services/github/graphqlService";

interface GitHubContextType {
  githubService: GitHubService | null;
  graphqlService: GitHubGraphQLService | null;
  isLoading: boolean;
}

const GitHubContext = createContext<GitHubContextType>({
  githubService: null,
  graphqlService: null,
  isLoading: true,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      const accessToken = session.accessToken as string;
      setGithubService(new GitHubService(accessToken));
      setGraphQLService(new GitHubGraphQLService(accessToken));
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setGithubService(null);
      setGraphQLService(null);
      setIsLoading(false);
    }
  }, [session, status]);

  return (
    <GitHubContext.Provider value={{ githubService, graphqlService, isLoading }}>
      {children}
    </GitHubContext.Provider>
  );
}
