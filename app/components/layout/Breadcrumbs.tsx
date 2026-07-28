"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useBreadcrumbs } from "../../hooks/useBreadcrumbs";

/**
 * Route trail in the topbar. Collapses to the last two crumbs on narrow
 * viewports so deep repo paths do not push out the topbar actions.
 */
export default function Breadcrumbs() {
  const crumbs = useBreadcrumbs();
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const hiddenOnMobile = crumbs.length > 2 && index < crumbs.length - 2;
          return (
            <li
              key={`${crumb.label}-${index}`}
              className={hiddenOnMobile ? "hidden items-center gap-1 sm:flex" : "flex items-center gap-1"}
            >
              {index > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-text-subtle" />}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="max-w-40 truncate text-text-muted hover:text-text"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="max-w-52 truncate font-medium text-text" aria-current="page">
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
