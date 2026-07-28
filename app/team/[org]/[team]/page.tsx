"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
import PageHeader from "../../../components/layout/PageHeader";
import { useGitHub } from "../../../context/GitHubContext";
import { GitHubRepository } from "../../../types/github";
import Link from "next/link";
import { StarIcon, ShareIcon } from "@heroicons/react/24/outline";
import TeamMembersList from "../../../components/team/TeamMembersList";
import TeamContributionChart from "../../../components/team/TeamContributionChart";
import TeamActivityTimeline from "../../../components/team/TeamActivityTimeline";
import {
  buttonStyles,
  Card,
  EmptyState,
  ErrorState,
  Select,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui";

interface TeamDetails {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  permission: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
}

type Metric = "commits" | "pullRequests" | "issues" | "reviews";

const METRIC_OPTIONS = [
  { value: "commits", label: "Commits" },
  { value: "pullRequests", label: "Pull requests" },
  { value: "issues", label: "Issues" },
  { value: "reviews", label: "Reviews" },
];

const CHART_OPTIONS = [
  { value: "bar", label: "Bar chart" },
  { value: "pie", label: "Pie chart" },
];

function PanelHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold text-text">{children}</h2>;
}

/** Label/value row for the team information card. */
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="text-xs font-medium text-text">{value}</dd>
    </div>
  );
}

export default function TeamPage() {
  const { githubService } = useGitHub();
  const params = useParams();
  const orgName = params.org as string;
  const teamSlug = params.team as string;

  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<Metric>("commits");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    async function fetchTeamDetails() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);

        const team = await githubService.getTeam(orgName, teamSlug);
        setTeamDetails(team as TeamDetails);

        const repos = await githubService.getTeamRepositories(orgName, teamSlug);
        setRepositories(repos as GitHubRepository[]);
      } catch (err) {
        console.error("Error fetching team details:", err);
        setError("Failed to load team details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamDetails();
  }, [githubService, orgName, teamSlug]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-64 items-center justify-center">
          <Spinner size={20} label="Loading team" />
        </div>
      </MainLayout>
    );
  }

  if (error || !teamDetails) {
    return (
      <MainLayout>
        <ErrorState
          title="Team unavailable"
          message={error ?? "Team not found, or you don't have access to view it."}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Tabs defaultValue="overview">
        <PageHeader
          title={teamDetails.name}
          description={teamDetails.description ?? `${orgName}/${teamDetails.slug}`}
          actions={
            <a
              href={teamDetails.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              View on GitHub
            </a>
          }
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="repositories" count={repositories.length}>
              Repositories
            </TabsTrigger>
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid gap-5 lg:grid-cols-2">
              <section>
                <PanelHeading>Team information</PanelHeading>
                <Card className="p-4">
                  <dl className="space-y-2">
                    <DetailRow label="Name" value={teamDetails.name} />
                    <DetailRow label="Slug" value={teamDetails.slug} />
                    <DetailRow
                      label="Privacy"
                      value={<span className="capitalize">{teamDetails.privacy}</span>}
                    />
                    <DetailRow label="Repositories" value={repositories.length} />
                  </dl>
                </Card>
              </section>

              <section>
                <PanelHeading>Contribution distribution</PanelHeading>
                <TeamContributionChart
                  org={orgName}
                  team_slug={teamSlug}
                  chartType="pie"
                  metric={chartMetric}
                />
              </section>
            </div>

            <section>
              <PanelHeading>Recent team activity</PanelHeading>
              <TeamActivityTimeline org={orgName} team_slug={teamSlug} />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <TeamMembersList org={orgName} team_slug={teamSlug} />
        </TabsContent>

        <TabsContent value="repositories">
          {repositories.length === 0 ? (
            <EmptyState
              title="No repositories"
              description="This team doesn't have access to any repositories."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {repositories.map((repo) => (
                <Link key={repo.id} href={`/repositories/${orgName}/${repo.name}`}>
                  <Card interactive className="h-full p-4">
                    <span className="truncate text-sm font-medium text-text">{repo.name}</span>
                    {repo.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-text-muted">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
                      {repo.language && <span>{repo.language}</span>}
                      <span className="flex items-center gap-1">
                        <StarIcon className="size-3.5" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShareIcon className="size-3.5" />
                        {repo.forks_count}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contributions">
          <div className="mb-4 flex flex-wrap gap-3">
            <Select
              label="Metric"
              value={chartMetric}
              onValueChange={(value) => setChartMetric(value as Metric)}
              options={METRIC_OPTIONS}
            />
            <Select
              label="Chart type"
              value={chartType}
              onValueChange={(value) => setChartType(value as "bar" | "pie")}
              options={CHART_OPTIONS}
            />
          </div>
          <TeamContributionChart
            org={orgName}
            team_slug={teamSlug}
            chartType={chartType}
            metric={chartMetric}
          />
        </TabsContent>

        <TabsContent value="activity">
          <TeamActivityTimeline org={orgName} team_slug={teamSlug} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
