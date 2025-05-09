import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContext from "./context/AuthContext";
import { GitHubProvider } from "./context/GitHubContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitHub Nexus",
  description: "A Web-Based Full Workflow Automation Hub Using GitHub API",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContext>
          <GitHubProvider>
            <NotificationsProvider>
              <ThemeProvider>
                <NextUIProvider>
                  {children}
                </NextUIProvider>
              </ThemeProvider>
            </NotificationsProvider>
          </GitHubProvider>
        </AuthContext>
      </body>
    </html>
  );
}
