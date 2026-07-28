"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import { Tab, Tabs } from "@nextui-org/react";
import MainLayout from "../components/layout/MainLayout";
import ActivityStatistics from "../components/activity/ActivityStatistics";
import ActivityFilters, { ActivityFilters as ActivityFiltersType } from "../components/activity/ActivityFilters";
import EnhancedActivityTimeline from "../components/activity/EnhancedActivityTimeline";
import ActivityCalendar from "../components/activity/ActivityCalendar";
import RepositoryActivity from "../components/activity/RepositoryActivity";
import ContributionsAnalysis from "../components/activity/ContributionsAnalysis";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ActivityPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<{ name: string; full_name: string }[]>([]);
  const [activityStats, setActivityStats] = useState({
    commits: 0, pullRequests: 0, issues: 0, reviews: 0, comments: 0, repositories: 0,
  });
  const [filters, setFilters] = useState<ActivityFiltersType>({
    eventTypes: [], timeRange: '', repositories: [],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/auth/signin');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchRepositories() {
      if (!githubService) return;
      try {
        setIsLoading(true);
        setError(null);
        const user = await githubService.getCurrentUser();
        const repos = await githubService.getUserRepositories(user.login, 1, 100);
        setRepositories(repos.map((repo: Record<string, unknown>) => ({ name: repo.name as string, full_name: repo.full_name as string })));
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setError("Failed to load repositories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchRepositories();
  }, [githubService]);

  useEffect(() => {
    async function fetchActivityStats() {
      if (!githubService) return;
      try {
        setIsLoading(true);
        const user = await githubService.getCurrentUser();
        const events = await githubService.getUserEvents(user.login, 100);
        const stats = { commits: 0, pullRequests: 0, issues: 0, reviews: 0, comments: 0, repositories: repositories.length };
        events.forEach((event) => {
          switch (event.type) {
            case 'PushEvent': {
              stats.commits += event.payload.commits?.length || 0;
              break;
            }
            case 'PullRequestEvent': stats.pullRequests++; break;
            case 'IssuesEvent': stats.issues++; break;
            case 'PullRequestReviewEvent': stats.reviews++; break;
            case 'IssueCommentEvent':
            case 'CommitCommentEvent':
            case 'PullRequestReviewCommentEvent': stats.comments++; break;
          }
        });
        setActivityStats(stats);
      } catch (err) {
        console.error("Error fetching activity stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (repositories.length > 0) fetchActivityStats();
  }, [githubService, repositories]);

  if (authLoading || githubLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl text-sm">
          Please sign in to view your activity.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Activity Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and analyze your GitHub activity across repositories</p>
        </div>

        <div className="mb-8">
          <ActivityStatistics stats={activityStats} isLoading={isLoading} />
        </div>

        <div className="mb-8">
          <ActivityCalendar />
        </div>

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

        <ActivityFilters
          filters={filters}
          onFiltersChange={setFilters}
          repositories={repositories}
        />

        <div>
          {activeTab === "timeline" && <EnhancedActivityTimeline filters={filters} pageSize={10} />}
          {activeTab === "repositories" && <RepositoryActivity filters={filters} />}
          {activeTab === "contributions" && <ContributionsAnalysis filters={filters} />}
        </div>
      </div>
    </MainLayout>
  );
}
