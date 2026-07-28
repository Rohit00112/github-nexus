"use client";

import { useQuery } from "@tanstack/react-query";
import { useGitHub } from "../../context/GitHubContext";
import { qk } from "./keys";

export const REPOS_PER_PAGE = 30;

/** One page of the given user's repositories. */
export function useRepositories(login: string | undefined, page = 1) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.list(login ?? "", page),
    enabled: !!githubService && !!login,
    queryFn: () => githubService!.getUserRepositories(login!, page, REPOS_PER_PAGE),
  });
}

export function useRepository(owner?: string, repo?: string) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.detail(owner ?? "", repo ?? ""),
    enabled: !!githubService && !!owner && !!repo,
    queryFn: () => githubService!.getRepository(owner!, repo!),
  });
}

export function useRepositoryLanguages(owner?: string, repo?: string) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.languages(owner ?? "", repo ?? ""),
    enabled: !!githubService && !!owner && !!repo,
    staleTime: 5 * 60_000,
    queryFn: () => githubService!.getLanguages(owner!, repo!),
  });
}

export function useRepositoryBranches(owner?: string, repo?: string) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.branches(owner ?? "", repo ?? ""),
    enabled: !!githubService && !!owner && !!repo,
    queryFn: () => githubService!.getBranches(owner!, repo!),
  });
}

export function useRepositoryContributors(owner?: string, repo?: string) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.contributors(owner ?? "", repo ?? ""),
    enabled: !!githubService && !!owner && !!repo,
    queryFn: () => githubService!.getContributors(owner!, repo!),
  });
}

export function useRepositoryReleases(owner?: string, repo?: string) {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.repos.releases(owner ?? "", repo ?? ""),
    enabled: !!githubService && !!owner && !!repo,
    queryFn: () => githubService!.getReleases(owner!, repo!),
  });
}

/** Repository search. Disabled until the query is non-empty. */
export function useRepositorySearch(query: string, page = 1, sort?: "stars" | "forks" | "updated") {
  const { githubService } = useGitHub();
  const trimmed = query.trim();

  return useQuery({
    queryKey: [...qk.repos.search(trimmed, page), sort ?? "best"],
    enabled: !!githubService && trimmed.length > 0,
    queryFn: () =>
      githubService!.searchRepositories({
        query: trimmed,
        sort,
        per_page: REPOS_PER_PAGE,
        page,
      }),
  });
}
