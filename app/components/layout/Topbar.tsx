"use client";

import { FC } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ViewColumnsIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useCommandPalette } from "../../context/CommandPaletteContext";
import NotificationBell from "../notifications/NotificationBell";
import AuthMethodBadge from "../ui/AuthMethodBadge";
import ThemeToggle from "../ui/ThemeToggle";
import Tooltip from "../ui/Tooltip";
import Kbd from "../ui/Kbd";
import Breadcrumbs from "./Breadcrumbs";

interface TopbarProps {
  onToggleDrawer: () => void;
  onToggleCollapse: () => void;
  onOpenShortcuts: () => void;
}

/**
 * Sticky bar holding location (breadcrumbs) and global actions. Navigation
 * itself lives only in the sidebar, so nothing here duplicates it.
 */
const Topbar: FC<TopbarProps> = ({ onToggleDrawer, onToggleCollapse, onOpenShortcuts }) => {
  const { isAuthenticated } = useAuth();
  const { setOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-border bg-bg/80 px-3 backdrop-blur-xl">
      <button
        onClick={onToggleDrawer}
        aria-label="Open navigation"
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text md:hidden"
      >
        <Bars3Icon className="size-4" />
      </button>

      <Tooltip content="Toggle sidebar" side="bottom">
        <button
          onClick={onToggleCollapse}
          aria-label="Toggle sidebar width"
          className="hidden size-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text md:inline-flex"
        >
          <ViewColumnsIcon className="size-4" />
        </button>
      </Tooltip>

      <Breadcrumbs />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {isAuthenticated && (
          <button
            onClick={() => setOpen(true)}
            className="flex h-7 items-center gap-2 rounded-md border border-border bg-surface px-2 text-xs text-text-subtle hover:border-border-strong hover:text-text-muted"
          >
            <MagnifyingGlassIcon className="size-3.5" />
            <span className="hidden sm:inline">Search</span>
            <span className="hidden items-center gap-0.5 sm:flex">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        )}

        {isAuthenticated && <AuthMethodBadge />}
        {isAuthenticated && <NotificationBell />}

        <Tooltip content="Keyboard shortcuts" shortcut="?" side="bottom">
          <button
            onClick={onOpenShortcuts}
            aria-label="Keyboard shortcuts"
            className="hidden size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text sm:inline-flex"
          >
            <QuestionMarkCircleIcon className="size-4" />
          </button>
        </Tooltip>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default Topbar;
