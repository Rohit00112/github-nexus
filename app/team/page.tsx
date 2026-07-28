"use client";

import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { useGitHub } from "../context/GitHubContext";
import Link from "next/link";
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  SkeletonCard,
} from "../components/ui";

interface Organization {
  login: string;
  avatar_url: string;
  description: string | null;
}

export default function TeamCollaborationPage() {
  const { githubService } = useGitHub();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      if (!githubService) return;
      try {
        setIsLoading(true);
        setError(null);
        const orgs = await githubService.getUserOrganizations();
        setOrganizations(orgs);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError("Failed to load organizations. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrganizations();
  }, [githubService]);

  return (
    <MainLayout>
      <PageHeader
        title="Teams"
        description="Browse your organizations, their teams, and member activity"
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : organizations.length === 0 ? (
        <EmptyState
          title="No organizations"
          description="You don't belong to any organizations yet. Organizations let you manage team access to repositories."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Link key={org.login} href={`/team/${org.login}`} className="group">
              <Card interactive className="h-full p-4">
                <div className="flex items-center gap-2.5">
                  <Avatar src={org.avatar_url} name={org.login} size="lg" square />
                  <span className="truncate text-sm font-medium text-text">{org.login}</span>
                </div>
                {org.description && (
                  <p className="mt-2.5 line-clamp-2 text-xs text-text-muted">{org.description}</p>
                )}
                <span className="mt-3 inline-block text-xs font-medium text-accent">
                  View teams &rarr;
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
