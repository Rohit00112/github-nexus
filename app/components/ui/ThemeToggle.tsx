"use client";

import { FC } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/cn";
import Tooltip from "./Tooltip";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: FC<ThemeToggleProps> = ({ className }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <Tooltip content={`Switch to ${next} theme`} side="bottom">
      <button
        onClick={toggleTheme}
        aria-label={`Switch to ${next} theme`}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text",
          className
        )}
      >
        {resolvedTheme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;
