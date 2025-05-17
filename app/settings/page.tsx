"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Card, CardBody, CardHeader, Divider, Button, Tabs, Tab } from "@nextui-org/react";
import ProfileSettings from "../components/settings/ProfileSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import IntegrationSettings from "../components/settings/IntegrationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";

// Mark this page as dynamically rendered
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your GitHub Nexus account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card className="sticky top-6">
            <CardBody className="p-0">
              <nav>
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                        activeTab === "profile"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("appearance")}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                        activeTab === "appearance"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                      </svg>
                      <span>Appearance</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("notifications")}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                        activeTab === "notifications"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      <span>Notifications</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("integrations")}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                        activeTab === "integrations"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Integrations</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("security")}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                        activeTab === "security"
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Security</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </CardBody>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <Card>
            <CardBody className="p-6">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "appearance" && <AppearanceSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "integrations" && <IntegrationSettings />}
              {activeTab === "security" && <SecuritySettings />}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
