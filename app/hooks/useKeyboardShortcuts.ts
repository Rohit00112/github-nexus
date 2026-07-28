"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ALL_NAV_ITEMS } from "../lib/navigation";

/** True when focus sits in a field, where single-letter shortcuts must not fire. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable ||
    target.getAttribute("role") === "combobox"
  );
}

interface Options {
  onOpenPalette: () => void;
  onOpenShortcuts: () => void;
}

/**
 * Global keys: ⌘K / Ctrl+K and `/` open the palette, `?` opens the cheatsheet,
 * and `g` followed by a nav key jumps to that page. Sequences time out after
 * 1.2s so a stray `g` does not swallow the next keypress forever.
 */
export function useKeyboardShortcuts({ onOpenPalette, onOpenShortcuts }: Options) {
  const router = useRouter();
  const pendingGo = useRef(false);
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearGo = () => {
      pendingGo.current = false;
      if (goTimer.current) {
        clearTimeout(goTimer.current);
        goTimer.current = null;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;

      if (meta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        clearGo();
        onOpenPalette();
        return;
      }

      if (meta || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      if (pendingGo.current) {
        const match = ALL_NAV_ITEMS.find((item) => item.goKey === event.key.toLowerCase());
        clearGo();
        if (match) {
          event.preventDefault();
          router.push(match.href);
        }
        return;
      }

      switch (event.key) {
        case "/":
          event.preventDefault();
          onOpenPalette();
          break;
        case "?":
          event.preventDefault();
          onOpenShortcuts();
          break;
        case "g":
        case "G":
          event.preventDefault();
          pendingGo.current = true;
          goTimer.current = setTimeout(clearGo, 1200);
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearGo();
    };
  }, [router, onOpenPalette, onOpenShortcuts]);
}

/**
 * Arrow / j / k navigation over a list, plus Enter to open the active row.
 * Returns the active index; callers pass it to DataTable for the focus ring.
 */
export function useListNavigation<T>(options: {
  items: T[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  onSelect?: (item: T) => void;
  /** Called on `x` — used for row selection in bulk-action tables. */
  onToggle?: (item: T) => void;
  enabled?: boolean;
}) {
  const { items, activeIndex, setActiveIndex, onSelect, onToggle, enabled = true } = options;

  useEffect(() => {
    if (!enabled || items.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey) return;

      const move = (delta: number) => {
        event.preventDefault();
        const next = Math.min(items.length - 1, Math.max(0, activeIndex + delta));
        setActiveIndex(next);
      };

      switch (event.key) {
        case "j":
        case "ArrowDown":
          move(1);
          break;
        case "k":
        case "ArrowUp":
          move(activeIndex < 0 ? 0 : -1);
          break;
        case "Enter":
          if (activeIndex >= 0 && onSelect) {
            event.preventDefault();
            onSelect(items[activeIndex]);
          }
          break;
        case "x":
          if (activeIndex >= 0 && onToggle) {
            event.preventDefault();
            onToggle(items[activeIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enabled, items, activeIndex, setActiveIndex, onSelect, onToggle]);
}
