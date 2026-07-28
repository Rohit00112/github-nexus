"use client";

import * as Radix from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

export const Popover = Radix.Root;
export const PopoverTrigger = Radix.Trigger;
export const PopoverClose = Radix.Close;
export const PopoverAnchor = Radix.Anchor;

export function PopoverContent({
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
          "z-50 w-72 rounded-lg border border-border bg-elevated p-3 shadow-lg shadow-black/25 animate-scale-in",
          className
        )}
        {...props}
      />
    </Radix.Portal>
  );
}

export default Popover;
