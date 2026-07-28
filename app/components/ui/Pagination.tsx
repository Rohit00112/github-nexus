"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { cn } from "../../lib/cn";
import Button from "./Button";

interface PaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  /** Whether a next page exists. GitHub list endpoints rarely give a total. */
  hasNext: boolean;
  loading?: boolean;
  className?: string;
}

export default function Pagination({
  page,
  onPageChange,
  hasNext,
  loading,
  className,
}: PaginationProps) {
  if (page === 1 && !hasNext) return null;

  return (
    <div className={cn("flex items-center justify-between gap-3 pt-3", className)}>
      <span className="text-xs text-text-subtle">Page {page}</span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          startIcon={<ChevronLeftIcon className="size-3.5" />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasNext || loading}
          onClick={() => onPageChange(page + 1)}
          endIcon={<ChevronRightIcon className="size-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
