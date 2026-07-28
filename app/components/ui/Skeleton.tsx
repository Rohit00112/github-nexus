"use client";

import { cn } from "../../lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "block" | "circle";
}

/** Placeholder shape shown while data loads. Replaces page-level spinners. */
export default function Skeleton({ className, variant = "line", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-surface-hover",
        variant === "line" && "h-3 rounded-sm",
        variant === "block" && "rounded-lg",
        variant === "circle" && "rounded-full",
        className
      )}
      {...props}
    />
  );
}

/** N stacked lines with a shortened last line, for paragraph-ish content. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

/** Card-shaped placeholder matching the density of a real Card + CardBody. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="size-8 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="w-1/3" />
          <Skeleton className="w-1/2" />
        </div>
      </div>
    </div>
  );
}

/** Placeholder rows for DataTable-shaped content. */
export function SkeletonRows({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("divide-y divide-border rounded-lg border border-border", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton variant="circle" className="size-5 shrink-0" />
          <Skeleton className="w-1/4" />
          <Skeleton className="ml-auto w-16" />
        </div>
      ))}
    </div>
  );
}
