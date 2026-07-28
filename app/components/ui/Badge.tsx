"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-surface-hover border-border text-text-muted",
        accent: "bg-accent-muted border-transparent text-accent",
        success: "bg-success-muted border-transparent text-success",
        warning: "bg-warning-muted border-transparent text-warning",
        danger: "bg-danger-muted border-transparent text-danger",
        info: "bg-info-muted border-transparent text-info",
        merged: "bg-merged-muted border-transparent text-merged",
        outline: "bg-transparent border-border text-text-muted",
      },
      size: {
        sm: "h-4 px-1.5 text-2xs",
        md: "h-5 px-2 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badge> {
  /** Shows a leading status dot in the current text color. */
  dot?: boolean;
}

export default function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ variant, size }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/** Free-form color chip used for GitHub labels, which carry their own hex. */
export function ColorBadge({
  color,
  children,
  className,
}: {
  /** Hex without the leading `#`, as GitHub returns it. */
  color: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        className
      )}
      style={{
        color: `#${color}`,
        borderColor: `#${color}59`,
        backgroundColor: `#${color}1f`,
      }}
    >
      {children}
    </span>
  );
}
