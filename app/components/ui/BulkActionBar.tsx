"use client";

import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "../../lib/cn";

interface BulkActionBarProps {
  count: number;
  onClear: () => void;
  /** Buttons for the selected rows. Rendered right of the count. */
  children: React.ReactNode;
  className?: string;
}

/** Floating bar shown while table rows are selected. Renders nothing at zero. */
export default function BulkActionBar({ count, onClear, children, className }: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className={cn(
        "fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-elevated px-3 py-2 shadow-xl shadow-black/40 animate-slide-up",
        className
      )}
    >
      <span className="text-sm font-medium text-text">
        {count} selected
      </span>
      <span className="h-4 w-px bg-border" />
      <div className="flex items-center gap-1.5">{children}</div>
      <button
        aria-label="Clear selection"
        onClick={onClear}
        className="rounded p-1 text-text-subtle hover:bg-surface-hover hover:text-text"
      >
        <XMarkIcon className="size-4" />
      </button>
    </div>
  );
}
