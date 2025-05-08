"use client";

import { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import PendingReviewsList from "../components/code-review/PendingReviewsList";

export default function CodeReviewDashboardPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed" | "requested">("pending");

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Code Review Dashboard</h1>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Pending Reviews
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "completed"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Completed Reviews
              </button>
              <button
                onClick={() => setActiveTab("requested")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requested"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                My Review Requests
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "pending" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Pull Requests Awaiting Your Review</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              These pull requests are waiting for your review. Click on a pull request to view details and submit your review.
            </p>
            <PendingReviewsList limit={100} />
          </div>
        )}

        {activeTab === "completed" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Completed Reviews</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This feature is coming soon. You'll be able to see all the pull requests you've reviewed.
            </p>
          </div>
        )}

        {activeTab === "requested" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">My Review Requests</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              This feature is coming soon. You'll be able to see all the pull requests where you've requested reviews.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
