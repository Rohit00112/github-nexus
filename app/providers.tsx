"use client";

import { ReactNode, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { GitHubProvider } from "./context/GitHubContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { AutomationProvider } from "./context/AutomationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { makeQueryClient } from "./lib/queryClient";
import { ToastProvider } from "./components/ui/Toast";
import { TooltipProvider } from "./components/ui/Tooltip";

export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across renders
  // without sharing cache between users during SSR.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ToastProvider>
            <GitHubProvider>
              <AutomationProvider>
                <NotificationsProvider>{children}</NotificationsProvider>
              </AutomationProvider>
            </GitHubProvider>
          </ToastProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
