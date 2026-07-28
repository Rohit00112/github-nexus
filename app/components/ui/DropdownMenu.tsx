"use client";

import * as Radix from "@radix-ui/react-dropdown-menu";
import { cn } from "../../lib/cn";

export const DropdownMenu = Radix.Root;
export const DropdownMenuTrigger = Radix.Trigger;

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof Radix.Content>) {
  return (
    <Radix.Portal>
      <Radix.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-44 overflow-hidden rounded-lg border border-border bg-elevated p-1 shadow-lg shadow-black/25 animate-scale-in",
          className
        )}
        {...props}
      />
    </Radix.Portal>
  );
}

export function DropdownMenuItem({
  className,
  danger,
  ...props
}: React.ComponentProps<typeof Radix.Item> & { danger?: boolean }) {
  return (
    <Radix.Item
      className={cn(
        "flex h-7 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm outline-none data-[disabled]:opacity-40",
        danger
          ? "text-danger data-[highlighted]:bg-danger-muted"
          : "text-text-muted data-[highlighted]:bg-surface-hover data-[highlighted]:text-text",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof Radix.Label>) {
  return (
    <Radix.Label
      className={cn("px-2 py-1.5 text-2xs font-medium uppercase tracking-wider text-text-subtle", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Radix.Separator>) {
  return <Radix.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export function DropdownMenuCheckboxItem({
  className,
  ...props
}: React.ComponentProps<typeof Radix.CheckboxItem>) {
  return (
    <Radix.CheckboxItem
      className={cn(
        "flex h-7 cursor-default select-none items-center gap-2 rounded-sm px-2 text-sm text-text-muted outline-none data-[highlighted]:bg-surface-hover data-[highlighted]:text-text data-[state=checked]:text-text",
        className
      )}
      {...props}
    />
  );
}

export const DropdownMenuItemIndicator = Radix.ItemIndicator;
export const DropdownMenuGroup = Radix.Group;
