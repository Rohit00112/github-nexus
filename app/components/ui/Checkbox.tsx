"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "@heroicons/react/20/solid";
import { useId } from "react";
import { cn } from "../../lib/cn";

interface CheckboxProps {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function Checkbox({
  checked,
  onCheckedChange,
  label,
  hint,
  disabled,
  className,
  id,
  ...props
}: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <RadixCheckbox.Root
        id={boxId}
        checked={checked}
        onCheckedChange={(next) => onCheckedChange?.(next === true)}
        disabled={disabled}
        aria-label={props["aria-label"]}
        className="mt-px flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-bg disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent"
      >
        <RadixCheckbox.Indicator className="text-accent-fg">
          {checked === "indeterminate" ? (
            <MinusIcon className="size-3" />
          ) : (
            <CheckIcon className="size-3" />
          )}
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      {(label || hint) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={boxId} className="block cursor-pointer text-sm text-text">
              {label}
            </label>
          )}
          {hint && <p className="text-xs text-text-subtle">{hint}</p>}
        </div>
      )}
    </div>
  );
}
