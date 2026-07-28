"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export interface Crumb {
  label: string;
  /** Omitted for the final crumb, which is the current page. */
  href?: string;
}

/** Static segments get a friendly label; anything else passes through. */
const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  repositories: "Repositories",
  "pull-requests": "Pull requests",
  "code-review": "Code review",
  issues: "Issues",
  projects: "Projects",
  beta: "Beta",
  gists: "Gists",
  automation: "Automation",
  insights: "Insights",
  activity: "Activity",
  notifications: "Notifications",
  team: "Team",
  settings: "Settings",
  documentation: "Docs",
  search: "Search",
  actions: "Actions",
  workflows: "Workflows",
  runs: "Runs",
  discussions: "Discussions",
  pull: "Pull request",
  auth: "Account",
  signin: "Sign in",
  signout: "Sign out",
  error: "Error",
};

/** Segments that only group routes and should not appear as their own crumb. */
const TRANSPARENT = new Set(["pull", "runs", "workflows"]);

function labelFor(segment: string): string {
  if (LABELS[segment]) return LABELS[segment];
  // Numeric ids read better as "#42" than as a bare number.
  if (/^\d+$/.test(segment)) return `#${segment}`;
  return decodeURIComponent(segment);
}

/**
 * Derives breadcrumbs from the current pathname. Owner and repo segments pass
 * through verbatim so `/repositories/acme/api/pull/42` reads as
 * "Repositories / acme / api / #42".
 */
export function useBreadcrumbs(): Crumb[] {
  const pathname = usePathname();

  return useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const crumbs: Crumb[] = [];

    segments.forEach((segment, index) => {
      if (TRANSPARENT.has(segment)) return;
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;
      crumbs.push({ label: labelFor(segment), href: isLast ? undefined : href });
    });

    return crumbs;
  }, [pathname]);
}
