"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/cn";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export interface CardProps extends DivProps {
  /** Adds hover affordance. Use when the whole card is a link or button. */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-surface",
        interactive && "hover:border-border-strong hover:bg-surface-hover transition-colors",
        className
      )}
      {...props}
    />
  );
});

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 border-b border-border px-4 py-3", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-text", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs text-text-muted", className)} {...props} />;
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3 border-t border-border px-4 py-2.5", className)}
      {...props}
    />
  );
}

export default Card;
