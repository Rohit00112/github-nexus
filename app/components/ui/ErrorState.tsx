"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { cn } from "../../lib/cn";
import Button from "./Button";

interface ErrorStateProps {
  title?: string;
  /** Accepts an Error so callers can pass a caught value straight through. */
  message?: string | Error | null;
  onRetry?: () => void;
  className?: string;
  bare?: boolean;
}

function toMessage(message?: string | Error | null) {
  if (!message) return "Something went wrong. Try again.";
  return typeof message === "string" ? message : message.message;
}

export default function ErrorState({
  title = "Couldn't load this",
  message,
  onRetry,
  className,
  bare,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        !bare && "rounded-lg border border-danger/30 bg-danger-muted",
        className
      )}
    >
      <ExclamationTriangleIcon className="mb-2 size-5 text-danger" />
      <p className="text-sm font-medium text-text">{title}</p>
      <p className="mt-1 max-w-md text-xs text-text-muted">{toMessage(message)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Compact inline variant for errors next to a form or inside a card body. */
export function InlineError({ message, className }: { message?: string | Error | null; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger",
        className
      )}
    >
      <ExclamationTriangleIcon className="mt-px size-3.5 shrink-0" />
      <span className="min-w-0">{toMessage(message)}</span>
    </div>
  );
}
