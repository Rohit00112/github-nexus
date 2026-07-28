"use client";

import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import PendingReviewsList from "../components/code-review/PendingReviewsList";

export default function CodeReviewDashboardPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "requested">("pending");

  return (
    <MainLayout>
      <div className="py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Code Review Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and manage pull request reviews</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {[
              { key: "pending" as const, label: "Pending Reviews" },
              { key: "completed" as const, label: "Completed Reviews" },
              { key: "requested" as const, label: "My Review Requests" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 px-4 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "pending" && (
          <div>
            <p className="text-sm text-muted-foreground mb-6">
              These pull requests are waiting for your review. Click on a pull request to view details and submit your review.
            </p>
            <PendingReviewsList limit={100} />
          </div>
        )}

        {activeTab === "completed" && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">Completed Reviews</h3>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. You&apos;ll be able to see all the pull requests you&apos;ve reviewed.
            </p>
          </div>
        )}

        {activeTab === "requested" && (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">My Review Requests</h3>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. You&apos;ll be able to see all the pull requests where you&apos;ve requested reviews.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
