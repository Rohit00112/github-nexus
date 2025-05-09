"use client";

import { useEffect, useState } from "react";
import { useGitHub } from "../../context/GitHubContext";
import Link from "next/link";
import Image from "next/image";

interface TeamActivityTimelineProps {
  org: string;
  team_slug?: string;
}

interface TimelineEvent {
  id: string;
  type: "commit" | "pull_request" | "issue" | "discussion";
  title: string;
  url: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
    full_name: string;
  };
}

export default function TeamActivityTimeline({ org, team_slug }: TeamActivityTimelineProps) {
  const { githubService } = useGitHub();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeamActivity() {
      if (!githubService) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get team members
        let members: any[] = [];
        
        if (team_slug) {
          members = await githubService.getTeamMembers(org, team_slug);
        } else {
          members = await githubService.getOrganizationMembers(org);
        }
        
        // Get team repositories
        let repositories: any[] = [];
        
        if (team_slug) {
          repositories = await githubService.getTeamRepositories(org, team_slug);
        } else {
          // For org level, we'll just use a sample of repositories
          const orgRepos = await githubService.octokit.rest.repos.listForOrg({
            org,
            per_page: 5,
            sort: "updated",
          });
          repositories = orgRepos.data;
        }
        
        // Collect recent activity
        const allEvents: TimelineEvent[] = [];
        
        // Get recent pull requests
        for (const repo of repositories.slice(0, 3)) { // Limit to 3 repos to avoid rate limiting
          try {
            const pulls = await githubService.octokit.rest.pulls.list({
              owner: org,
              repo: repo.name,
              state: "all",
              per_page: 5,
              sort: "updated",
            });
            
            for (const pull of pulls.data) {
              if (members.some(m => m.login === pull.user?.login)) {
                allEvents.push({
                  id: `pr-${pull.id}`,
                  type: "pull_request",
                  title: pull.title,
                  url: pull.html_url,
                  created_at: pull.created_at,
                  user: {
                    login: pull.user?.login || "unknown",
                    avatar_url: pull.user?.avatar_url || "",
                  },
                  repo: {
                    name: repo.name,
                    full_name: `${org}/${repo.name}`,
                  },
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching pull requests for ${repo.name}:`, err);
          }
          
          // Get recent issues
          try {
            const issues = await githubService.octokit.rest.issues.listForRepo({
              owner: org,
              repo: repo.name,
              state: "all",
              per_page: 5,
              sort: "updated",
            });
            
            for (const issue of issues.data) {
              // Skip pull requests (GitHub API returns PRs as issues)
              if (issue.pull_request) continue;
              
              if (members.some(m => m.login === issue.user?.login)) {
                allEvents.push({
                  id: `issue-${issue.id}`,
                  type: "issue",
                  title: issue.title,
                  url: issue.html_url,
                  created_at: issue.created_at,
                  user: {
                    login: issue.user?.login || "unknown",
                    avatar_url: issue.user?.avatar_url || "",
                  },
                  repo: {
                    name: repo.name,
                    full_name: `${org}/${repo.name}`,
                  },
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching issues for ${repo.name}:`, err);
          }
          
          // Get recent commits
          try {
            const commits = await githubService.octokit.rest.repos.listCommits({
              owner: org,
              repo: repo.name,
              per_page: 5,
            });
            
            for (const commit of commits.data) {
              if (members.some(m => m.login === commit.author?.login)) {
                allEvents.push({
                  id: `commit-${commit.sha}`,
                  type: "commit",
                  title: commit.commit.message.split("\n")[0], // Get first line of commit message
                  url: commit.html_url,
                  created_at: commit.commit.author?.date || "",
                  user: {
                    login: commit.author?.login || "unknown",
                    avatar_url: commit.author?.avatar_url || "",
                  },
                  repo: {
                    name: repo.name,
                    full_name: `${org}/${repo.name}`,
                  },
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching commits for ${repo.name}:`, err);
          }
        }
        
        // Sort events by date (newest first)
        const sortedEvents = allEvents.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Limit to 20 most recent events
        setEvents(sortedEvents.slice(0, 20));
      } catch (err) {
        console.error("Error fetching team activity:", err);
        setError("Failed to load team activity. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeamActivity();
  }, [githubService, org, team_slug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded-md">
        No recent team activity found.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Team Activity</h3>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div className="flex-shrink-0">
              <Image
                src={event.user.avatar_url}
                alt={`${event.user.login}'s avatar`}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {event.user.login}
                </span>
                
                <span className="text-gray-500 dark:text-gray-400">
                  {event.type === "commit" && "committed"}
                  {event.type === "pull_request" && "opened a pull request"}
                  {event.type === "issue" && "opened an issue"}
                  {event.type === "discussion" && "started a discussion"}
                </span>
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.created_at).toLocaleDateString()} at{" "}
                  {new Date(event.created_at).toLocaleTimeString()}
                </span>
              </div>
              
              <Link
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {event.title}
              </Link>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                in {event.repo.full_name}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {event.type === "commit" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Commit
                </span>
              )}
              {event.type === "pull_request" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  PR
                </span>
              )}
              {event.type === "issue" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Issue
                </span>
              )}
              {event.type === "discussion" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Discussion
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
