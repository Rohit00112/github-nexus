"use client";

import * as Radix from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

export default function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof Radix.Root>) {
  return (
    <Radix.Root
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
}
