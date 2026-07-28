"use client";

import { useParams } from "next/navigation";
import MainLayout from "../../../../components/layout/MainLayout";
import PageHeader from "../../../../components/layout/PageHeader";
import CommitActivityChart from "../../../../components/insights/CommitActivityChart";
import CodeFrequencyChart from "../../../../components/insights/CodeFrequencyChart";
import ContributorsChart from "../../../../components/insights/ContributorsChart";
import PunchCardChart from "../../../../components/insights/PunchCardChart";
import RepositoryStatsCard from "../../../../components/insights/RepositoryStatsCard";
import GraphQLRepositoryInsights from "../../../../components/insights/GraphQLRepositoryInsights";
import {
  buttonStyles,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui";

/** Heading for a single insight panel. */
function PanelHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-text">{title}</h2>
      <p className="mt-0.5 text-xs text-text-muted">{hint}</p>
    </div>
  );
}

export default function RepositoryInsightsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  return (
    <MainLayout>
      <Tabs defaultValue="overview">
        <PageHeader
          title="Insights"
          description={`${owner}/${repo}`}
          actions={
            <a
              href={`https://github.com/${owner}/${repo}/pulse`}
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
            <TabsTrigger value="graphql">GraphQL</TabsTrigger>
            <TabsTrigger value="commits">Commit activity</TabsTrigger>
            <TabsTrigger value="code">Code frequency</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="punchcard">Commit time</TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="overview">
          <div className="space-y-5">
            <RepositoryStatsCard owner={owner} repo={repo} />
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <PanelHeading title="Commit activity" hint="Commits per week over the past year." />
                <CommitActivityChart owner={owner} repo={repo} />
              </div>
              <div>
                <PanelHeading title="Contributors" hint="Share of commits per contributor." />
                <ContributorsChart owner={owner} repo={repo} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="graphql">
          <PanelHeading
            title="GraphQL insights"
            hint="Repository detail fetched through GitHub's GraphQL API for fewer round trips."
          />
          <GraphQLRepositoryInsights owner={owner} repo={repo} />
        </TabsContent>

        <TabsContent value="commits">
          <PanelHeading
            title="Commit activity"
            hint="Each bar is the total number of commits for one week."
          />
          <CommitActivityChart owner={owner} repo={repo} />
        </TabsContent>

        <TabsContent value="code">
          <PanelHeading
            title="Code frequency"
            hint="Lines added and removed each week."
          />
          <CodeFrequencyChart owner={owner} repo={repo} />
        </TabsContent>

        <TabsContent value="contributors">
          <PanelHeading
            title="Contributors"
            hint="Share of commits per contributor."
          />
          <ContributorsChart owner={owner} repo={repo} />
        </TabsContent>

        <TabsContent value="punchcard">
          <PanelHeading
            title="Commit time distribution"
            hint="Circle size is the number of commits for that hour and weekday."
          />
          <PunchCardChart owner={owner} repo={repo} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
