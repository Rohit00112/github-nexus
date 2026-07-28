"use client";

import * as Radix from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";

export const Tabs = Radix.Root;

/** Underline tab row. Scrolls horizontally instead of wrapping on narrow viewports. */
export function TabsList({ className, ...props }: React.ComponentProps<typeof Radix.List>) {
  return (
    <Radix.List
      className={cn(
        "scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-border",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  count,
  children,
  ...props
}: React.ComponentProps<typeof Radix.Trigger> & { count?: number }) {
  return (
    <Radix.Trigger
      className={cn(
        "relative flex h-9 shrink-0 items-center gap-1.5 rounded-t-md px-3 text-sm text-text-muted whitespace-nowrap hover:text-text data-[state=active]:text-text",
        // Active underline sits on top of the list's bottom border.
        "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-accent",
        className
      )}
      {...props}
    >
      {children}
      {count !== undefined && (
        <span className="rounded-full bg-surface-hover px-1.5 text-2xs text-text-muted">{count}</span>
      )}
    </Radix.Trigger>
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof Radix.Content>) {
  return <Radix.Content className={cn("pt-4 outline-none", className)} {...props} />;
}

export default Tabs;
