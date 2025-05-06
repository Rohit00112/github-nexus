"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GitHubService } from "../services/github/githubService";

interface GitHubContextType {
  githubService: GitHubService | null;
  isLoading: boolean;
}

const GitHubContext = createContext<GitHubContextType>({
  githubService: null,
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      setGithubService(new GitHubService(session.accessToken as string));
      setIsLoading(false);
    } else if (status === "unauthenticated") {
      setGithubService(null);
      setIsLoading(false);
    }
  }, [session, status]);

  return (
    <GitHubContext.Provider value={{ githubService, isLoading }}>
      {children}
    </GitHubContext.Provider>
  );
}
