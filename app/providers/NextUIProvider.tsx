"use client";

import { NextUIProvider as NextUIProviderBase } from "@nextui-org/react";
import { useTheme } from "next-themes";

export function NextUIProvider({ children }: { children: React.ReactNode }) {
  const { theme: _theme } = useTheme();

  return (
    <NextUIProviderBase>
      {children}
    </NextUIProviderBase>
  );
}
