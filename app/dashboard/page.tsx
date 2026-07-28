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
import type { GitHubService } from '../services/github/githubService';

type CurrentUser = Awaited<ReturnType<GitHubService["getCurrentUser"]>>;

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { githubService, isLoading: githubLoading } = useGitHub();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState({ repositories: 0, pullRequests: 0, issues: 0, stars: 0, followers: 0, following: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    showStatistics: true, showContributionChart: true, showContributionHeatmap: true,
    showProjectProgress: true, showActivityTimeline: true, contributionChartType: 'pie',
    contributionMetric: 'commits', activityLimit: 5, projectLimit: 3
  });

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/auth/signin'); }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('github-nexus-dashboard-config');
      if (savedConfig) { try { setDashboardConfig(JSON.parse(savedConfig)); } catch {} }
    }
  }, []);

  useEffect(() => {
    async function fetchUserData() {
      if (!githubService || !isAuthenticated) return;
      try {
        setIsLoading(true); setError(null);
        const userData = await githubService.getCurrentUser();
        setUser(userData);
        const repos = await githubService.getUserRepositories(userData.login, 1, 100);
        const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count ?? 0), 0);
        let pullRequestsCount = 0;
        for (let i = 0; i < Math.min(5, repos.length); i++) {
          const pulls = await githubService.getPullRequests(repos[i].owner.login, repos[i].name, 1, 100);
          pullRequestsCount += pulls.length;
        }
        let issuesCount = 0;
        for (let i = 0; i < Math.min(5, repos.length); i++) {
          const issues = await githubService.getIssues(repos[i].owner.login, repos[i].name, 1, 100);
          issuesCount += issues.filter((issue) => !issue.pull_request).length;
        }
        setStats({ repositories: repos.length, pullRequests: pullRequestsCount, issues: issuesCount, stars: totalStars, followers: userData.followers, following: userData.following });
      } catch { setError("Failed to load dashboard data."); } finally { setIsLoading(false); }
    }
    fetchUserData();
  }, [githubService, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && user) {
      if (headerRef.current) fadeInUp(headerRef.current);
      if (statsRef.current && dashboardConfig.showStatistics) fadeInUp(statsRef.current.querySelectorAll('.stat-card'), 0.3, 0.1);
      if (chartsRef.current && dashboardConfig.showContributionChart) { const el = chartsRef.current.querySelector('.contribution-chart'); if (el) fadeInLeft(el, 0.5); }
      if (chartsRef.current && dashboardConfig.showProjectProgress) { const el = chartsRef.current.querySelector('.project-progress'); if (el) fadeInRight(el, 0.5); }
      if (heatmapRef.current && dashboardConfig.showContributionHeatmap) fadeInUp(heatmapRef.current, 0.6);
      if (activityRef.current && dashboardConfig.showActivityTimeline) fadeInUp(activityRef.current, 0.7);
    }
  }, [isLoading, user, dashboardConfig]);

  if (authLoading || githubLoading) {
    return <MainLayout><div className="flex justify-center items-center h-96"><LoadingSpinner size="large" /></div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="py-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-64"><LoadingSpinner size="medium" /></div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm">{error}</div>
        ) : user ? (
          <>
            <div ref={headerRef} className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, <span className="font-medium text-foreground">{user.name || user.login}</span>. Here&apos;s your GitHub overview.
                </p>
              </div>
              <DashboardSettings config={dashboardConfig} onConfigChange={setDashboardConfig} />
            </div>

            {dashboardConfig.showStatistics && (
              <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                  { title: "Repos", value: stats.repositories, color: "blue" as const, icon: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" },
                  { title: "PRs", value: stats.pullRequests, color: "purple" as const, icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
                  { title: "Issues", value: stats.issues, color: "green" as const, icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
                  { title: "Stars", value: stats.stars, color: "yellow" as const, icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
                  { title: "Followers", value: stats.followers, color: "indigo" as const, icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
                  { title: "Following", value: stats.following, color: "red" as const, icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349" },
                ].map((stat) => (
                  <div key={stat.title} className="stat-card">
                    <StatisticsCard
                      title={stat.title}
                      value={stat.value}
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} /></svg>}
                      color={stat.color}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {dashboardConfig.showContributionChart && (
                <div ref={chartsRef} className="contribution-chart">
                  <h2 className="text-base font-semibold mb-3">Contribution Distribution</h2>
                  <ContributionChart chartType={dashboardConfig.contributionChartType} metric={dashboardConfig.contributionMetric} animationDelay={600} />
                </div>
              )}
              {dashboardConfig.showProjectProgress && (
                <div className="project-progress">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-semibold">Project Progress</h2>
                    <Link href="/projects" className="text-xs text-primary hover:underline">View All</Link>
                  </div>
                  <ProjectProgress limit={dashboardConfig.projectLimit} animationDelay={700} />
                </div>
              )}
            </div>

            {dashboardConfig.showContributionHeatmap && (
              <div ref={heatmapRef} className="mb-8">
                <ContributionHeatmap animationDelay={750} />
              </div>
            )}

            {dashboardConfig.showActivityTimeline && (
              <div ref={activityRef}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-semibold">Recent Activity</h2>
                  <Link href="/activity" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </Link>
                </div>
                <ActivityTimeline limit={dashboardConfig.activityLimit} animationDelay={800} />
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-4 rounded-xl text-sm">
            Please sign in to view your dashboard.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
