import { QueryClient } from "@tanstack/react-query";

/**
 * Shared client factory. GitHub data is not realtime, so lists stay fresh for
 * 30s and we do not refetch on window focus — that behavior made the old
 * pages re-hit the API on every tab switch and burn rate limit.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
