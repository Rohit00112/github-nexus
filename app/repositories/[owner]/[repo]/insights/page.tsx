"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import MainLayout from "../../../../components/layout/MainLayout";
import CommitActivityChart from "../../../../components/insights/CommitActivityChart";
import CodeFrequencyChart from "../../../../components/insights/CodeFrequencyChart";
import ContributorsChart from "../../../../components/insights/ContributorsChart";
import PunchCardChart from "../../../../components/insights/PunchCardChart";
import RepositoryStatsCard from "../../../../components/insights/RepositoryStatsCard";
import GraphQLRepositoryInsights from "../../../../components/insights/GraphQLRepositoryInsights";
import Link from "next/link";

export default function RepositoryInsightsPage() {
  const params = useParams();
  const ownerName = params.owner as string;
  const repoName = params.repo as string;
  const [activeTab, setActiveTab] = useState<string>("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "graphql", label: "GraphQL Insights" },
    { id: "commits", label: "Commit Activity" },
    { id: "code", label: "Code Frequency" },
    { id: "contributors", label: "Contributors" },
    { id: "punchcard", label: "Commit Time" },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Link href="/repositories" className="hover:text-blue-600 dark:hover:text-blue-400">
              Repositories
            </Link>
            <span>/</span>
            <Link href={`/repositories/${ownerName}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {ownerName}
            </Link>
            <span>/</span>
            <Link href={`/repositories/${ownerName}/${repoName}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {repoName}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-200">Insights</span>
          </div>
          <h1 className="text-2xl font-bold flex items-center">
            <Link href={`/repositories/${ownerName}/${repoName}`} className="hover:underline">
              {repoName}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span>Insights</span>
          </h1>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <RepositoryStatsCard owner={ownerName} repo={repoName} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Commit Activity</h3>
                <CommitActivityChart owner={ownerName} repo={repoName} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contributors</h3>
                <ContributorsChart owner={ownerName} repo={repoName} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "commits" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Commit Activity</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View the commit activity for this repository over the past year. Each bar represents the total number of commits for a week.
            </p>
            <CommitActivityChart owner={ownerName} repo={repoName} />
          </div>
        )}

        {activeTab === "code" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Code Frequency</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View the code frequency for this repository. The chart shows the number of lines added and removed each week.
            </p>
            <CodeFrequencyChart owner={ownerName} repo={repoName} />
          </div>
        )}

        {activeTab === "contributors" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Contributors</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View the contribution distribution for this repository. The chart shows the percentage of commits made by each contributor.
            </p>
            <ContributorsChart owner={ownerName} repo={repoName} />
          </div>
        )}

        {activeTab === "punchcard" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Commit Time Distribution</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View when commits are made to this repository. The size of each circle represents the number of commits made during that hour and day of the week.
            </p>
            <PunchCardChart owner={ownerName} repo={repoName} />
          </div>
        )}

        {activeTab === "graphql" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">GraphQL Repository Insights</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              View detailed repository information fetched using GitHub's GraphQL API for improved performance and reduced API calls.
            </p>
            <GraphQLRepositoryInsights owner={ownerName} repo={repoName} />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
