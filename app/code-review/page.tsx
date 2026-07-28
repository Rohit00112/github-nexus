"use client";

import MainLayout from "../components/layout/MainLayout";
import PageHeader from "../components/layout/PageHeader";
import PendingReviewsList from "../components/code-review/PendingReviewsList";
import {
  EmptyState,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui";

const CLIPBOARD_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BELL_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export default function CodeReviewDashboardPage() {
  return (
    <MainLayout>
      <Tabs defaultValue="pending">
        <PageHeader
          title="Code review"
          description="Review and manage pull request reviews"
        >
          <TabsList>
            <TabsTrigger value="pending">Pending reviews</TabsTrigger>
            <TabsTrigger value="completed">Completed reviews</TabsTrigger>
            <TabsTrigger value="requested">My review requests</TabsTrigger>
          </TabsList>
        </PageHeader>

        <TabsContent value="pending">
          <p className="mb-4 text-sm text-text-muted">
            These pull requests are waiting for your review. Select one to view details and submit your review.
          </p>
          <PendingReviewsList limit={100} />
        </TabsContent>

        <TabsContent value="completed">
          <EmptyState
            icon={CLIPBOARD_ICON}
            title="Completed reviews"
            description="Coming soon — every pull request you have reviewed will show up here."
          />
        </TabsContent>

        <TabsContent value="requested">
          <EmptyState
            icon={BELL_ICON}
            title="My review requests"
            description="Coming soon — pull requests where you requested a review will show up here."
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
