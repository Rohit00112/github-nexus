"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useGitHub } from "../context/GitHubContext";
import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import { ErrorState, Spinner, Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui";
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
  const [error, setError] = useState<string | null>(null);
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
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} label="Loading activity" />
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <ErrorState title="Sign in required" message="Sign in to view your activity." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Activity"
        description="Track and analyze your GitHub activity across repositories"
      />

      <div className="space-y-6">
        <ActivityStatistics stats={activityStats} isLoading={isLoading} />

        <ActivityCalendar />

        {error && <ErrorState message={error} />}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
          </TabsList>

          <ActivityFilters
            filters={filters}
            onFiltersChange={setFilters}
            repositories={repositories}
          />

          <TabsContent value="timeline">
            <EnhancedActivityTimeline filters={filters} pageSize={10} />
          </TabsContent>
          <TabsContent value="repositories">
            <RepositoryActivity filters={filters} />
          </TabsContent>
          <TabsContent value="contributions">
            <ContributionsAnalysis filters={filters} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
