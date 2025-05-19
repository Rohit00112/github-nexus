"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import ActivityStatistics from "../components/activity/ActivityStatistics";
import ActivityFilters, { ActivityFilters as ActivityFiltersType } from "../components/activity/ActivityFilters";
import EnhancedActivityTimeline from "../components/activity/EnhancedActivityTimeline";
import ActivityCalendar from "../components/activity/ActivityCalendar";
import RepositoryActivity from "../components/activity/RepositoryActivity";
import ContributionsAnalysis from "../components/activity/ContributionsAnalysis";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ActivityPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<{ name: string; full_name: string }[]>([]);
  const [activityStats, setActivityStats] = useState({
    commits: 0,
    pullRequests: 0,
    issues: 0,
    reviews: 0,
    comments: 0,
    repositories: 0
  });
  const [filters, setFilters] = useState<ActivityFiltersType>({
    eventTypes: [],
    timeRange: '',
    repositories: []
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user repositories
  useEffect(() => {
    async function fetchRepositories() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);

        const user = await githubService.getCurrentUser();
        const repos = await githubService.getUserRepositories(user.login, 1, 100);

        setRepositories(repos.map((repo: any) => ({
          name: repo.name,
          full_name: repo.full_name
        })));
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setError("Failed to load repositories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepositories();
  }, [githubService]);

  // Fetch activity statistics
  useEffect(() => {
    async function fetchActivityStats() {
      if (!githubService) return;

      try {
        setIsLoading(true);

        const user = await githubService.getCurrentUser();

        // Get user events
        const events = await githubService.getUserEvents(user.login, 100);

        // Count different event types
        const stats = {
          commits: 0,
          pullRequests: 0,
          issues: 0,
          reviews: 0,
          comments: 0,
          repositories: repositories.length
        };

        events.forEach((event: any) => {
          switch (event.type) {
            case 'PushEvent':
              stats.commits += event.payload.commits?.length || 0;
              break;
            case 'PullRequestEvent':
              stats.pullRequests++;
              break;
            case 'IssuesEvent':
              stats.issues++;
              break;
            case 'PullRequestReviewEvent':
              stats.reviews++;
              break;
            case 'IssueCommentEvent':
            case 'CommitCommentEvent':
            case 'PullRequestReviewCommentEvent':
              stats.comments++;
              break;
          }
        });

        setActivityStats(stats);
      } catch (err) {
        console.error("Error fetching activity stats:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (repositories.length > 0) {
      fetchActivityStats();
    }
  }, [githubService, repositories]);

  if (authLoading || githubLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md">
        Please sign in to view your activity.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Activity Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track and analyze your GitHub activity across repositories
        </p>
      </div>

      {/* Activity Statistics */}
      <div className="mb-8">
        <ActivityStatistics stats={activityStats} isLoading={isLoading} />
      </div>

      {/* Activity Calendar */}
      <div className="mb-8">
        <ActivityCalendar />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          size="lg"
          aria-label="Activity tabs"
        >
          <Tab key="timeline" title="Activity Timeline" />
          <Tab key="repositories" title="Repository Activity" />
          <Tab key="contributions" title="Contributions" />
        </Tabs>
      </div>

      {/* Filters */}
      <ActivityFilters
        filters={filters}
        onFiltersChange={setFilters}
        repositories={repositories}
      />

      {/* Tab Content */}
      <div>
        {activeTab === "timeline" && (
          <EnhancedActivityTimeline filters={filters} pageSize={10} />
        )}

        {activeTab === "repositories" && (
          <RepositoryActivity filters={filters} />
        )}

        {activeTab === "contributions" && (
          <ContributionsAnalysis filters={filters} />
        )}
      </div>
    </div>
  );
}
