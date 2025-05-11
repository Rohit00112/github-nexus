"use client";

import { ReactNode } from "react";
import { GitHubProvider } from "./context/GitHubContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { AutomationProvider } from "./context/AutomationContext";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./context/ThemeContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextUIProvider>
      <ThemeProvider>
        <GitHubProvider>
          <AutomationProvider>
            <NotificationsProvider>
              {children}
            </NotificationsProvider>
          </AutomationProvider>
        </GitHubProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
