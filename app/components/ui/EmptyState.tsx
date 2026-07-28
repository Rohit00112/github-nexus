"use client";

import { cn } from "../../lib/cn";

interface EmptyStateProps {
  /** Rendered in a muted circle. Size it at 20px. */
  icon?: React.ReactNode;
  title: string;
  description?: string;
  /** Primary call to action. */
  action?: React.ReactNode;
  className?: string;
  /** Removes the surrounding border, for use inside an existing Card. */
  bare?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  bare,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-14 text-center",
        !bare && "rounded-lg border border-dashed border-border bg-surface/50",
        className
      )}
    >
      {icon && (
        <div className="mb-3 flex size-10 items-center justify-center rounded-full border border-border bg-surface text-text-subtle">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
