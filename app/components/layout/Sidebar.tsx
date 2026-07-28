"use client";

import Link from "next/link";
import { FC } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowLeftOnRectangleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { NAV_SECTIONS, isNavItemActive } from "../../lib/navigation";
import { cn } from "../../lib/cn";
import Avatar from "../ui/Avatar";
import Tooltip from "../ui/Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

interface SidebarProps {
  /** Mobile drawer visibility. Ignored at md and above. */
  isOpen: boolean;
  onClose: () => void;
  /** Icon-rail mode on desktop. */
  collapsed: boolean;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose, collapsed }) => {
  const { isAuthenticated, session } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-150 ease-out",
          collapsed ? "w-[52px]" : "w-60",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Brand — doubles as the drawer header on mobile. */}
        <div
          className={cn(
            "flex h-12 shrink-0 items-center border-b border-border",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden" onClick={onClose}>
            <Image src="/logo.svg" alt="" width={20} height={20} className="shrink-0" priority />
            {!collapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-text">
                GitHub Nexus
              </span>
            )}
          </Link>
        </div>

        <nav className="scrollbar-none flex-1 overflow-y-auto px-2 py-3">
          {isAuthenticated ? (
            <div className="space-y-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  {!collapsed && (
                    <h3 className="mb-1 px-2 text-2xs font-medium uppercase tracking-wider text-text-subtle">
                      {section.label}
                    </h3>
                  )}
                  <ul className="space-y-px">
                    {section.items.map((item) => {
                      const active = isNavItemActive(pathname, item.href);
                      const Icon = item.icon;
                      const link = (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex h-8 items-center gap-2.5 rounded-md text-sm",
                            collapsed ? "justify-center px-0" : "px-2",
                            active
                              ? "bg-surface-hover font-medium text-text"
                              : "text-text-muted hover:bg-surface-hover hover:text-text"
                          )}
                        >
                          {/* Accent marker instead of a filled pill. */}
                          {active && (
                            <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" />
                          )}
                          <Icon className="size-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                      );

                      return (
                        <li key={item.href}>
                          {collapsed ? (
                            <Tooltip content={item.label} side="right">
                              {link}
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <Link
              href="/auth/signin"
              onClick={onClose}
              className="flex h-8 items-center gap-2.5 rounded-md px-2 text-sm text-text-muted hover:bg-surface-hover hover:text-text"
            >
              <ArrowLeftOnRectangleIcon className="size-4" />
              {!collapsed && <span>Sign in</span>}
            </Link>
          )}
        </nav>

        {/* Account menu pinned to the bottom. */}
        {isAuthenticated && (
          <div className="shrink-0 border-t border-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "flex w-full items-center gap-2 rounded-md py-1.5 text-left hover:bg-surface-hover",
                  collapsed ? "justify-center px-0" : "px-1.5"
                )}
              >
                <Avatar src={session?.user?.image} name={session?.user?.name} size="md" />
                {!collapsed && (
                  <span className="min-w-0 flex-1 truncate text-sm text-text">
                    {session?.user?.name ?? "Account"}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="truncate text-sm font-medium text-text">{session?.user?.name}</p>
                  <p className="truncate text-xs text-text-muted">{session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    <Cog6ToothIcon className="size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger asChild>
                  <Link href="/auth/signout" className="w-full">
                    <ArrowLeftOnRectangleIcon className="size-4" />
                    Sign out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
