"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { cn } from "../../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  "aria-label"?: string;
}

/** Token-styled select built on Radix, so keyboard + typeahead come for free. */
export default function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  label,
  size = "md",
  disabled,
  className,
  containerClassName,
  ...props
}: SelectProps) {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && <span className="block text-xs font-medium text-text-muted">{label}</span>}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          aria-label={props["aria-label"] ?? label}
          className={cn(
            "inline-flex w-full items-center justify-between gap-2 rounded-md border border-border bg-bg text-sm text-text hover:border-border-strong disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent data-[placeholder]:text-text-subtle",
            size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-2.5",
            className
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDownIcon className="size-3.5 text-text-subtle" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-elevated shadow-lg shadow-black/20 animate-scale-in"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex h-7 cursor-default select-none items-center rounded-sm pl-7 pr-2 text-sm text-text-muted outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-text data-[state=checked]:text-text data-[disabled]:opacity-40"
                >
                  <RadixSelect.ItemIndicator className="absolute left-1.5">
                    <CheckIcon className="size-3.5 text-accent" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
