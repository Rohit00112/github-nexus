"use client";

import { cn } from "../../lib/cn";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Right-aligned controls: primary buttons, menus, view switchers. */
  actions?: React.ReactNode;
  /** Rendered under the title block — typically a TabsList or a FilterBar. */
  children?: React.ReactNode;
  /** Small element before the title, e.g. an avatar or a state badge. */
  leading?: React.ReactNode;
  className?: string;
}

/** Uniform page heading used by every route, replacing per-page ad-hoc markup. */
export default function PageHeader({
  title,
  description,
  actions,
  children,
  leading,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {leading}
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-text">{title}</h1>
            {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
