"use client";

import { cn } from "../../lib/cn";

interface SpinnerProps {
  /** Pixel size of the square. */
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Inline indeterminate indicator. Used inside buttons and small inline slots
 * only — page and section loading uses Skeleton instead.
 */
export default function Spinner({ size = 14, className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-[-2px]", className)}
      style={{ width: size, height: size }}
    />
  );
}
