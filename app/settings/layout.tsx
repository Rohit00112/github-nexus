"use client";

import { ReactNode } from "react";
import MainLayout from "../components/layout/MainLayout";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout>
      <div className="py-6">
        {children}
      </div>
    </MainLayout>
  );
}
