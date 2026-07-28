"use client";

import * as RadixSwitch from "@radix-ui/react-switch";
import { useId } from "react";
import { cn } from "../../lib/cn";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export default function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
  disabled,
  className,
  id,
  ...props
}: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || hint) && (
        <div className="min-w-0">
          {label && (
            <label htmlFor={switchId} className="block cursor-pointer text-sm text-text">
              {label}
            </label>
          )}
          {hint && <p className="text-xs text-text-subtle">{hint}</p>}
        </div>
      )}
      <RadixSwitch.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={props["aria-label"]}
        className="relative h-5 w-9 shrink-0 rounded-full border border-border bg-surface-hover disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent data-[state=checked]:border-accent data-[state=checked]:bg-accent"
      >
        <RadixSwitch.Thumb className="block size-3.5 translate-x-[3px] rounded-full bg-text-muted transition-transform duration-140 will-change-transform data-[state=checked]:translate-x-[19px] data-[state=checked]:bg-accent-fg" />
      </RadixSwitch.Root>
    </div>
  );
}
