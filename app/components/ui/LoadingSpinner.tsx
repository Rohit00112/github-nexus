"use client";

import { FC } from "react";
import { cn } from "../../lib/cn";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: "blue" | "gray" | "white";
  className?: string;
}

const sizes = { small: 14, medium: 20, large: 32 } as const;

const colors = {
  blue: "text-accent",
  gray: "text-text-subtle",
  white: "text-text",
} as const;

/**
 * Legacy spinner kept for call sites not yet migrated. New code should use
 * Skeleton for section loading and Spinner for inline/button loading.
 */
const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = "medium", color = "blue", className }) => {
  const px = sizes[size];
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        colors[color],
        className
      )}
      style={{ width: px, height: px }}
    />
  );
};

export default LoadingSpinner;
