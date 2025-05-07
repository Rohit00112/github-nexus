"use client";

import { ReactNode } from "react";

interface ContentSectionProps {
  title: string;
  id?: string;
  children: ReactNode;
}

export default function ContentSection({ title, id, children }: ContentSectionProps) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </section>
  );
}

interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language = "typescript", children }: CodeBlockProps) {
  return (
    <div className="my-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">
        {language}
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}
