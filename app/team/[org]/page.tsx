"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import { useGitHub } from "../../context/GitHubContext";
import Link from "next/link";
import TeamMembersList from "../../components/team/TeamMembersList";
import TeamContributionChart from "../../components/team/TeamContributionChart";
import TeamActivityTimeline from "../../components/team/TeamActivityTimeline";

interface Team {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description: string;
  privacy: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  permission: string;
}

export default function OrganizationTeamsPage() {
  const { githubService } = useGitHub();
  const params = useParams();
  const router = useRouter();
  const orgName = params.org as string;
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [chartMetric, setChartMetric] = useState<"commits" | "pullRequests" | "issues" | "reviews">("commits");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    async function fetchTeams() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const teamsData = await githubService.getOrganizationTeams(orgName);
        setTeams(teamsData);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeams();
  }, [githubService, orgName]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members" },
    { id: "contributions", label: "Contributions" },
    { id: "activity", label: "Recent Activity" },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/team" className="hover:text-blue-600 dark:hover:text-blue-400">
            Team Collaboration
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200">{orgName}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold">{orgName}</h1>
          
          <div className="mt-4 md:mt-0">
            <Link
              href={`https://github.com/${orgName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View on GitHub
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Teams in {orgName}</h2>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
                      {error}
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
                      No teams found in this organization.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teams.map((team) => (
                        <Link
                          key={team.id}
                          href={`/team/${orgName}/${team.slug}`}
                          className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <h3 className="font-medium text-lg mb-1">{team.name}</h3>
                          {team.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                              {team.description}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 dark:text-gray-400">
                              {team.privacy}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              View team →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Contribution Distribution</h3>
                      <TeamContributionChart org={orgName} chartType="pie" metric={chartMetric} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                      <TeamActivityTimeline org={orgName} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "members" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Organization Members</h2>
                <TeamMembersList org={orgName} />
              </div>
            )}
            
            {activeTab === "contributions" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Member Contributions</h2>
                
                <div className="flex flex-wrap gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Metric
                    </label>
                    <select
                      value={chartMetric}
                      onChange={(e) => setChartMetric(e.target.value as any)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="commits">Commits</option>
                      <option value="pullRequests">Pull Requests</option>
                      <option value="issues">Issues</option>
                      <option value="reviews">Reviews</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chart Type
                    </label>
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as any)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="pie">Pie Chart</option>
                    </select>
                  </div>
                </div>
                
                <TeamContributionChart
                  org={orgName}
                  chartType={chartType}
                  metric={chartMetric}
                />
              </div>
            )}
            
            {activeTab === "activity" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Recent Organization Activity</h2>
                <TeamActivityTimeline org={orgName} />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
