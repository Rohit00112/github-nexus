"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { useGitHub } from '../context/GitHubContext';
import MainLayout from '../components/layout/MainLayout';
import StatisticsCard from '../components/dashboard/StatisticsCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import ContributionChart from '../components/dashboard/ContributionChart';
import ContributionHeatmap from '../components/dashboard/ContributionHeatmap';
import ProjectProgress from '../components/dashboard/ProjectProgress';
import DashboardSettings, { DashboardConfig } from '../components/dashboard/DashboardSettings';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { fadeInUp, fadeInLeft, fadeInRight } from '../utils/animations';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    repositories: 0,
    pullRequests: 0,
    issues: 0,
    stars: 0,
    followers: 0,
    following: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard configuration
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    showStatistics: true,
    showContributionChart: true,
    showContributionHeatmap: true,
    showProjectProgress: true,
    showActivityTimeline: true,
    contributionChartType: 'pie',
    contributionMetric: 'commits',
    activityLimit: 5,
    projectLimit: 3
  });

  // Refs for animation targets
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load dashboard configuration from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('github-nexus-dashboard-config');
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          setDashboardConfig(parsedConfig);
        } catch (err) {
          console.error('Error parsing dashboard config:', err);
        }
      }
    }
  }, []);

  // Fetch user data and statistics
  useEffect(() => {
    async function fetchUserData() {
      if (!githubService || !isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get user profile
        const userData = await githubService.getCurrentUser();
        setUser(userData);

        // Get repositories
        const repos = await githubService.getUserRepositories(userData.login, 1, 100);

        // Count stars
        const totalStars = repos.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);

        // Get pull requests (across first 5 repos)
        let pullRequestsCount = 0;
        for (let i = 0; i < Math.min(5, repos.length); i++) {
          const repo = repos[i];
          const pulls = await githubService.getPullRequests(repo.owner.login, repo.name, 1, 100);
          pullRequestsCount += pulls.length;
        }

        // Get issues (across first 5 repos)
        let issuesCount = 0;
        for (let i = 0; i < Math.min(5, repos.length); i++) {
          const repo = repos[i];
          const issues = await githubService.getIssues(repo.owner.login, repo.name, 1, 100);
          // Filter out pull requests which are also returned as issues
          const filteredIssues = issues.filter((issue: any) => !issue.pull_request);
          issuesCount += filteredIssues.length;
        }

        setStats({
          repositories: repos.length,
          pullRequests: pullRequestsCount,
          issues: issuesCount,
          stars: totalStars,
          followers: userData.followers,
          following: userData.following
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserData();
  }, [githubService, isAuthenticated]);

  // Apply animations after data is loaded
  useEffect(() => {
    if (!isLoading && user) {
      // Animate header
      if (headerRef.current) {
        fadeInUp(headerRef.current);
      }

      // Animate statistics cards
      if (statsRef.current && dashboardConfig.showStatistics) {
        fadeInUp(statsRef.current.querySelectorAll('.stat-card'), 0.3, 0.1);
      }

      // Animate charts section
      if (chartsRef.current && dashboardConfig.showContributionChart) {
        fadeInLeft(chartsRef.current.querySelector('.contribution-chart'), 0.5);
      }

      // Animate project progress
      if (chartsRef.current && dashboardConfig.showProjectProgress) {
        fadeInRight(chartsRef.current.querySelector('.project-progress'), 0.5);
      }

      // Animate heatmap
      if (heatmapRef.current && dashboardConfig.showContributionHeatmap) {
        fadeInUp(heatmapRef.current, 0.6);
      }

      // Animate activity timeline
      if (activityRef.current && dashboardConfig.showActivityTimeline) {
        fadeInUp(activityRef.current, 0.7);
      }
    }
  }, [isLoading, user, dashboardConfig]);

  if (authLoading || githubLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="large" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="medium" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 p-4 rounded-md">
            {error}
          </div>
        ) : user ? (
          <>
            {/* Header */}
            <div ref={headerRef} className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, <span className="font-medium">{user.name || user.login}</span>! Here's an overview of your GitHub activity.
                </p>
              </div>

              <DashboardSettings
                config={dashboardConfig}
                onConfigChange={setDashboardConfig}
              />
            </div>

            {/* Statistics Cards */}
            {dashboardConfig.showStatistics && (
              <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="stat-card">
                  <StatisticsCard
                    title="Repositories"
                    value={stats.repositories}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    }
                    color="blue"
                    animationDelay={0}
                  />
                </div>

                <div className="stat-card">
                  <StatisticsCard
                    title="Pull Requests"
                    value={stats.pullRequests}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    }
                    color="purple"
                    animationDelay={100}
                  />
                </div>

                <div className="stat-card">
                  <StatisticsCard
                    title="Issues"
                    value={stats.issues}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    }
                    color="green"
                    animationDelay={200}
                  />
                </div>

                <div className="stat-card">
                  <StatisticsCard
                    title="Stars Received"
                    value={stats.stars}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    }
                    color="yellow"
                    animationDelay={300}
                  />
                </div>

                <div className="stat-card">
                  <StatisticsCard
                    title="Followers"
                    value={stats.followers}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                    color="indigo"
                    animationDelay={400}
                  />
                </div>

                <div className="stat-card">
                  <StatisticsCard
                    title="Following"
                    value={stats.following}
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    color="red"
                    animationDelay={500}
                  />
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {dashboardConfig.showContributionChart && (
                <div ref={chartsRef} className="contribution-chart">
                  <h2 className="text-xl font-semibold mb-4">Contribution Distribution</h2>
                  <ContributionChart
                    chartType={dashboardConfig.contributionChartType}
                    metric={dashboardConfig.contributionMetric}
                    animationDelay={600}
                  />
                </div>
              )}

              {dashboardConfig.showProjectProgress && (
                <div className="project-progress">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Project Progress</h2>
                    <Link
                      href="/projects"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <ProjectProgress
                    limit={dashboardConfig.projectLimit}
                    animationDelay={700}
                  />
                </div>
              )}
            </div>

            {/* Contribution Heatmap */}
            {dashboardConfig.showContributionHeatmap && (
              <div ref={heatmapRef} className="mb-8">
                <ContributionHeatmap animationDelay={750} />
              </div>
            )}

            {/* Activity Timeline */}
            {dashboardConfig.showActivityTimeline && (
              <div ref={activityRef}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                  <Link
                    href="/activity"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                  >
                    <span>View Activity Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                <ActivityTimeline
                  limit={dashboardConfig.activityLimit}
                  animationDelay={800}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-md">
            Please sign in to view your dashboard.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
