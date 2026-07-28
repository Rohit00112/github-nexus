"use client";

import { useQuery } from "@tanstack/react-query";
import { useGitHub } from "../../context/GitHubContext";
import { qk } from "./keys";

/** The signed-in GitHub user. Cached longer than lists — it rarely changes. */
export function useCurrentUser() {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.user.current,
    enabled: !!githubService,
    staleTime: 5 * 60_000,
    queryFn: () => githubService!.getCurrentUser(),
  });
}

export function useUserOrganizations() {
  const { githubService } = useGitHub();

  return useQuery({
    queryKey: qk.user.organizations,
    enabled: !!githubService,
    staleTime: 5 * 60_000,
    queryFn: () => githubService!.getUserOrganizations(),
  });
}
