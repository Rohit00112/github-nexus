"use client";

import { cn } from "../../lib/cn";

/** Single key cap. Pass one key per element: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`. */
export default function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded border border-border bg-surface px-1 font-sans text-2xs font-medium text-text-subtle",
        className
      )}
    >
      {children}
    </kbd>
  );
}
