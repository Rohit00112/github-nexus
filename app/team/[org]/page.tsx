"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import PageHeader from "../../components/layout/PageHeader";
import { useGitHub } from "../../context/GitHubContext";
import Link from "next/link";
import TeamMembersList from "../../components/team/TeamMembersList";
import TeamContributionChart from "../../components/team/TeamContributionChart";
import TeamActivityTimeline from "../../components/team/TeamActivityTimeline";
import {
  Badge,
  buttonStyles,
  Card,
  EmptyState,
  ErrorState,
  Select,
  SkeletonCard,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui";

interface Team {
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

/** Heading for a panel inside a tab. */
function PanelHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-semibold text-text">{children}</h2>;
}

export default function OrganizationTeamsPage() {
  const { githubService } = useGitHub();
  const params = useParams();
  const orgName = params.org as string;

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<Metric>("commits");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    async function fetchTeams() {
      if (!githubService) return;

      try {
        setIsLoading(true);
        setError(null);
        const teamsData = await githubService.getOrganizationTeams(orgName);
        setTeams(teamsData as Team[]);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeams();
  }, [githubService, orgName]);

  return (
    <MainLayout>
      <Tabs defaultValue="overview">
        <PageHeader
          title={orgName}
          description="Teams, members, and contribution activity"
          actions={
            <a
              href={`https://github.com/${orgName}`}
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
            <TabsTrigger value="contributions">Contributions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="overview">
          <div className="space-y-6">
            <section>
              <PanelHeading>Teams</PanelHeading>
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : error ? (
                <ErrorState message={error} />
              ) : teams.length === 0 ? (
                <EmptyState
                  title="No teams"
                  description={`${orgName} has no teams, or your token cannot read them.`}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {teams.map((team) => (
                    <Link key={team.id} href={`/team/${orgName}/${team.slug}`}>
                      <Card interactive className="h-full p-4">
                        <div className="flex items-start justify-between gap-2">
                          <span className="truncate text-sm font-medium text-text">{team.name}</span>
                          <Badge size="sm" variant="outline">
                            {team.privacy}
                          </Badge>
                        </div>
                        {team.description && (
                          <p className="mt-2 line-clamp-2 text-xs text-text-muted">
                            {team.description}
                          </p>
                        )}
                        <span className="mt-3 inline-block text-xs font-medium text-accent">
                          View team &rarr;
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <section>
                <PanelHeading>Contribution distribution</PanelHeading>
                <TeamContributionChart org={orgName} chartType="pie" metric={chartMetric} />
              </section>
              <section>
                <PanelHeading>Recent activity</PanelHeading>
                <TeamActivityTimeline org={orgName} />
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <TeamMembersList org={orgName} />
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
          <TeamContributionChart org={orgName} chartType={chartType} metric={chartMetric} />
        </TabsContent>

        <TabsContent value="activity">
          <TeamActivityTimeline org={orgName} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
