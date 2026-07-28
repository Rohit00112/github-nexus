"use client";

import * as Radix from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

/** Mounted once near the app root so tooltips share delay/skip behavior. */
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <Radix.Provider delayDuration={400} skipDelayDuration={200}>
      {children}
    </Radix.Provider>
  );
}

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** Right-aligned hint text, typically a keyboard shortcut. */
  shortcut?: string;
  className?: string;
}

export default function Tooltip({ content, children, side = "top", shortcut, className }: TooltipProps) {
  return (
    <Radix.Root>
      <Radix.Trigger asChild>{children}</Radix.Trigger>
      <Radix.Portal>
        <Radix.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 flex items-center gap-2 rounded-md border border-border bg-elevated px-2 py-1 text-xs text-text shadow-md shadow-black/25 animate-fade-in",
            className
          )}
        >
          {content}
          {shortcut && (
            <span className="rounded border border-border bg-surface px-1 font-mono text-2xs text-text-subtle">
              {shortcut}
            </span>
          )}
        </Radix.Content>
      </Radix.Portal>
    </Radix.Root>
  );
}
