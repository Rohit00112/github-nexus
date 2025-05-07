"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DocLink {
  title: string;
  href: string;
}

interface DocSection {
  title: string;
  links: DocLink[];
}

const documentationSections: DocSection[] = [
  {
    title: "Getting Started",
    links: [
      { title: "Introduction", href: "/documentation" },
      { title: "Authentication", href: "/documentation/authentication" },
      { title: "Installation", href: "/documentation/installation" },
    ],
  },
  {
    title: "API Usage",
    links: [
      { title: "GitHub API Basics", href: "/documentation/api-basics" },
      { title: "Rate Limiting", href: "/documentation/rate-limiting" },
      { title: "Error Handling", href: "/documentation/error-handling" },
    ],
  },
  {
    title: "Features",
    links: [
      { title: "Repository Management", href: "/documentation/repositories" },
      { title: "Issues & Pull Requests", href: "/documentation/issues-prs" },
      { title: "GitHub Actions", href: "/documentation/actions" },
      { title: "Organizations", href: "/documentation/organizations" },
      { title: "Notifications", href: "/documentation/notifications" },
    ],
  },
  {
    title: "Advanced",
    links: [
      { title: "Webhooks", href: "/documentation/webhooks" },
      { title: "GraphQL API", href: "/documentation/graphql" },
      { title: "Custom Integrations", href: "/documentation/integrations" },
    ],
  },
];

export default function DocumentationSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Documentation</h2>
        <div className="space-y-6">
          {documentationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block px-2 py-1 rounded-md ${
                        pathname === link.href
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
