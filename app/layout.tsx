import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContext from "./context/AuthContext";
import { GitHubProvider } from "./context/GitHubContext";

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
    <html lang="en" className="no-js">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              document.documentElement.classList.remove('no-js');
              document.documentElement.classList.add('js');
            })();
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthContext>
          <GitHubProvider>
            {children}
          </GitHubProvider>
        </AuthContext>
      </body>
    </html>
  );
}
