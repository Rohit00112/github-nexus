"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import Spinner from "./Spinner";

/**
 * Shared recipe. Use directly on an `<a>` or next/link when the control
 * navigates — that keeps anchor semantics instead of nesting a button in a link.
 */
export const buttonStyles = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md border font-medium whitespace-nowrap select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
  {
    variants: {
      variant: {
        primary:
          "bg-accent border-accent text-accent-fg hover:bg-accent-hover hover:border-accent-hover",
        secondary:
          "bg-surface border-border text-text hover:bg-surface-hover hover:border-border-strong",
        ghost:
          "bg-transparent border-transparent text-text-muted hover:bg-surface-hover hover:text-text",
        subtle:
          "bg-accent-muted border-transparent text-accent hover:bg-accent hover:text-accent-fg",
        danger:
          "bg-transparent border-border text-danger hover:bg-danger-muted hover:border-danger",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-9 px-4 text-sm",
      },
      iconOnly: {
        true: "px-0 aspect-square",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonStyles> {
  loading?: boolean;
  /** Rendered before the label. Hidden while `loading`. */
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, iconOnly, loading, startIcon, endIcon, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonStyles({ variant, size, iconOnly }), className)}
      {...props}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 14} /> : startIcon}
      {children}
      {!loading && endIcon}
    </button>
  );
});

export default Button;
