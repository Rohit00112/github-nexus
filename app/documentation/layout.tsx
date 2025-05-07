"use client";

import { ReactNode } from "react";
import MainLayout from "../components/layout/MainLayout";
import DocumentationSidebar from "../components/documentation/Sidebar";

export default function DocumentationLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
        <DocumentationSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
