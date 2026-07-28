"use client";

import { useEffect, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useGitHub } from "../context/GitHubContext";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "../components/ui/LoadingSpinner";

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
      <div className="py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Team Collaboration</h1>
          <p className="text-sm text-muted-foreground mt-1">View your organizations and team structures</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-base font-semibold mb-2">About Team Collaboration</h2>
          <p className="text-sm text-muted-foreground mb-2">
            The Team Collaboration view provides insights into how teams are working together across GitHub repositories.
            View team members, their contributions, and recent activity to better understand team dynamics and productivity.
          </p>
          <p className="text-sm text-muted-foreground">
            Select an organization below to view its teams and members, or navigate directly to a specific team.
          </p>
        </div>

        <h2 className="text-base font-semibold mb-4">Your Organizations</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">{error}</div>
        ) : organizations.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-sm text-muted-foreground">
              You don&apos;t belong to any organizations. Organizations allow you to manage team access to repositories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.map((org) => (
              <Link
                key={org.login}
                href={`/team/${org.login}`}
                className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md p-5"
              >
                <div className="flex items-center space-x-3 mb-3">
                  {org.avatar_url && (
                    <Image
                      src={org.avatar_url}
                      alt={`${org.login} logo`}
                      className="w-10 h-10 rounded-full"
                      unoptimized
                      width={40}
                      height={40}
                    />
                  )}
                  <h3 className="text-base font-semibold">{org.login}</h3>
                </div>

                {org.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {org.description}
                  </p>
                )}

                <span className="text-xs text-primary font-medium">
                  View teams &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
