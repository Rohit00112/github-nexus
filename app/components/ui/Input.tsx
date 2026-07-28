"use client";

import { forwardRef, useId } from "react";
import { cn } from "../../lib/cn";

const fieldBase =
  "w-full rounded-md border bg-bg text-sm text-text placeholder:text-text-subtle disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, containerClassName, label, hint, error, startIcon, endAdornment, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle">
            {startIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-desc` : undefined}
          className={cn(
            fieldBase,
            "h-8 px-2.5",
            startIcon && "pl-8",
            endAdornment && "pr-8",
            error ? "border-danger" : "border-border hover:border-border-strong",
            className
          )}
          {...props}
        />
        {endAdornment && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle">
            {endAdornment}
          </span>
        )}
      </div>
      {(error || hint) && (
        <p id={`${inputId}-desc`} className={cn("text-xs", error ? "text-danger" : "text-text-subtle")}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, containerClassName, label, hint, error, id, ...props },
  ref
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={cn(
          fieldBase,
          "min-h-20 resize-y px-2.5 py-2 leading-relaxed",
          error ? "border-danger" : "border-border hover:border-border-strong",
          className
        )}
        {...props}
      />
      {(error || hint) && (
        <p className={cn("text-xs", error ? "text-danger" : "text-text-subtle")}>{error || hint}</p>
      )}
    </div>
  );
});

export default Input;
