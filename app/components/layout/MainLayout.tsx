"use client";

import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { CommandPaletteProvider, useCommandPalette } from "../../context/CommandPaletteContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { cn } from "../../lib/cn";
import CommandPalette from "../ui/CommandPalette";
import ShortcutsDialog from "../ui/ShortcutsDialog";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const COLLAPSE_KEY = "github-nexus:sidebar-collapsed";

interface MainLayoutProps {
  children: ReactNode;
  /** Removes the content max-width, for full-bleed views like project boards. */
  fullWidth?: boolean;
}

function Shell({ children, fullWidth }: MainLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { setOpen: setPaletteOpen } = useCommandPalette();

  // Restore the rail preference after mount so SSR markup stays stable.
  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), [setPaletteOpen]);
  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);

  useKeyboardShortcuts({ onOpenPalette: openPalette, onOpenShortcuts: openShortcuts });

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        collapsed={collapsed}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-150 ease-out",
          collapsed ? "md:pl-[52px]" : "md:pl-60"
        )}
      >
        <Topbar
          onToggleDrawer={() => setDrawerOpen((v) => !v)}
          onToggleCollapse={toggleCollapse}
          onOpenShortcuts={openShortcuts}
        />

        <main className="flex-1">
          <div className={cn("px-4 py-5 md:px-6", !fullWidth && "mx-auto max-w-[1400px]")}>
            {children}
          </div>
        </main>
      </div>

      <CommandPalette />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}

const MainLayout: FC<MainLayoutProps> = ({ children, fullWidth }) => (
  <CommandPaletteProvider>
    <Shell fullWidth={fullWidth}>{children}</Shell>
  </CommandPaletteProvider>
);

export default MainLayout;
