import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthContext from "./context/AuthContext";
import { Providers } from "./providers";

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
    icon: "/logo.svg",
  },
};

/**
 * Applies the stored theme before first paint so the page never flashes the
 * wrong palette. Dark is the default when nothing is stored.
 */
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('github-nexus:theme');
    var resolved = stored === 'light' || stored === 'dark' ? stored
      : stored === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 'dark';
    var root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthContext>
          <Providers>{children}</Providers>
        </AuthContext>
      </body>
    </html>
  );
}
