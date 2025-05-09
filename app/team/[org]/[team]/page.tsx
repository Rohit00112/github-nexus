"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
import { useGitHub } from "../../../context/GitHubContext";
import Link from "next/link";
import TeamMembersList from "../../../components/team/TeamMembersList";
import TeamContributionChart from "../../../components/team/TeamContributionChart";
import TeamActivityTimeline from "../../../components/team/TeamActivityTimeline";

interface TeamDetails {
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

interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  private: boolean;
  fork: boolean;
  language: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export default function TeamPage() {
  const { githubService } = useGitHub();
  const params = useParams();
  const router = useRouter();
  const orgName = params.org as string;
  const teamSlug = params.team as string;
  
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [chartMetric, setChartMetric] = useState<"commits" | "pullRequests" | "issues" | "reviews">("commits");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  useEffect(() => {
    async function fetchTeamDetails() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch team details
        const team = await githubService.getTeam(orgName, teamSlug);
        setTeamDetails(team);
        
        // Fetch team repositories
        const repos = await githubService.getTeamRepositories(orgName, teamSlug);
        setRepositories(repos);
      } catch (err) {
        console.error("Error fetching team details:", err);
        setError("Failed to load team details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeamDetails();
  }, [githubService, orgName, teamSlug]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members" },
    { id: "repositories", label: "Repositories" },
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
          <Link href={`/team/${orgName}`} className="hover:text-blue-600 dark:hover:text-blue-400">
            {orgName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200">{teamSlug}</span>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : !teamDetails ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
            Team not found or you don&apos;t have access to view this team.
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">{teamDetails.name}</h1>
              
              <div className="mt-4 md:mt-0">
                <Link
                  href={teamDetails.html_url}
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
            
            {teamDetails.description && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  {teamDetails.description}
                </p>
              </div>
            )}
            
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Team Information</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-gray-500 dark:text-gray-400">Name:</dt>
                              <dd className="font-medium">{teamDetails.name}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500 dark:text-gray-400">Slug:</dt>
                              <dd className="font-medium">{teamDetails.slug}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500 dark:text-gray-400">Privacy:</dt>
                              <dd className="font-medium capitalize">{teamDetails.privacy}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500 dark:text-gray-400">Repositories:</dt>
                              <dd className="font-medium">{repositories.length}</dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Contribution Distribution</h3>
                        <TeamContributionChart
                          org={orgName}
                          team_slug={teamSlug}
                          chartType="pie"
                          metric={chartMetric}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recent Team Activity</h3>
                      <TeamActivityTimeline org={orgName} team_slug={teamSlug} />
                    </div>
                  </div>
                )}
                
                {activeTab === "members" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    <TeamMembersList org={orgName} team_slug={teamSlug} />
                  </div>
                )}
                
                {activeTab === "repositories" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Team Repositories</h2>
                    
                    {repositories.length === 0 ? (
                      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
                        This team doesn&apos;t have access to any repositories.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {repositories.map((repo) => (
                          <Link
                            key={repo.id}
                            href={`/repositories/${orgName}/${repo.name}`}
                            className="block bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <h3 className="font-medium text-lg mb-1">{repo.name}</h3>
                            {repo.description && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                                {repo.description}
                              </p>
                            )}
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center space-x-4">
                                {repo.language && (
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {repo.language}
                                  </span>
                                )}
                                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                  </svg>
                                  {repo.stargazers_count}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                    />
                                  </svg>
                                  {repo.forks_count}
                                </span>
                              </div>
                              <span className="text-blue-600 dark:text-blue-400">
                                View repository →
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
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
                      team_slug={teamSlug}
                      chartType={chartType}
                      metric={chartMetric}
                    />
                  </div>
                )}
                
                {activeTab === "activity" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Team Activity</h2>
                    <TeamActivityTimeline org={orgName} team_slug={teamSlug} />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
