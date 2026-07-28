"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import MainLayout from "../components/layout/MainLayout";
import ProfileSettings from "../components/settings/ProfileSettings";
import AppearanceSettings from "../components/settings/AppearanceSettings";
import NotificationSettings from "../components/settings/NotificationSettings";
import IntegrationSettings from "../components/settings/IntegrationSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/auth/signin');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="medium" />
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
    { key: "appearance", label: "Appearance", icon: "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" },
    { key: "notifications", label: "Notifications", icon: "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" },
    { key: "integrations", label: "Integrations", icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" },
    { key: "security", label: "Security", icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  ];

  return (
    <MainLayout>
      <div className="py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your GitHub Nexus account settings and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Settings Navigation */}
          <div className="w-full md:w-56 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-2 sticky top-20">
              <nav>
                <ul className="space-y-0.5">
                  {tabs.map((tab) => (
                    <li key={tab.key}>
                      <button
                        onClick={() => setActiveTab(tab.key)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2.5 text-sm transition-colors ${
                          activeTab === tab.key
                            ? "bg-accent text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                        </svg>
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="bg-card border border-border rounded-xl p-6">
              {activeTab === "profile" && <ProfileSettings />}
              {activeTab === "appearance" && <AppearanceSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "integrations" && <IntegrationSettings />}
              {activeTab === "security" && <SecuritySettings />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
