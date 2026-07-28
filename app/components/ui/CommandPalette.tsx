"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowsRightLeftIcon,
  ExclamationCircleIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useCommandPalette } from "../../context/CommandPaletteContext";
import { useGitHub } from "../../context/GitHubContext";
import { useTheme } from "../../context/ThemeContext";
import { useDebounced } from "../../hooks/useDebounced";
import { ALL_NAV_ITEMS } from "../../lib/navigation";
import { qk } from "../../hooks/queries/keys";
import Kbd from "./Kbd";
import Spinner from "./Spinner";

const itemClass =
  "flex h-9 cursor-pointer select-none items-center gap-2.5 rounded-md px-2 text-sm text-text-muted outline-none data-[selected=true]:bg-surface-hover data-[selected=true]:text-text";

/**
 * ⌘K palette. Static destinations are always listed; repositories, issues, and
 * pull requests are searched remotely once the user types two characters.
 */
export default function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const { githubService } = useGitHub();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  // Reset the input whenever the palette reopens.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const searchTerm = debouncedQuery.trim();
  const shouldSearch = !!githubService && searchTerm.length >= 2;

  const { data: results, isFetching } = useQuery({
    queryKey: qk.search.palette(searchTerm),
    enabled: shouldSearch,
    staleTime: 60_000,
    queryFn: async () => {
      const [repos, issues] = await Promise.all([
        githubService!.searchRepositories({ query: searchTerm, per_page: 5 }),
        githubService!.searchIssuesGlobal({ query: searchTerm, per_page: 6 }),
      ]);
      return { repos: repos.items, issues: issues.items };
    },
  });

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-overlay backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-[15vh] z-[90] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl shadow-black/50 animate-scale-in"
        >
          <Dialog.Title className="sr-only">Search and commands</Dialog.Title>
          <Command shouldFilter={false} loop className="flex flex-col">
            <div className="flex h-11 items-center gap-2.5 border-b border-border px-3">
              <MagnifyingGlassIcon className="size-4 shrink-0 text-text-subtle" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search repositories, issues, pull requests…"
                className="h-full flex-1 bg-transparent text-sm text-text placeholder:text-text-subtle focus:outline-none"
              />
              {isFetching && <Spinner size={13} className="text-text-subtle" />}
              <Kbd>esc</Kbd>
            </div>

            <Command.List className="max-h-80 overflow-y-auto p-1.5">
              <Command.Empty className="py-8 text-center text-sm text-text-muted">
                {shouldSearch && !isFetching ? "No matches found." : "Type to search."}
              </Command.Empty>

              {results?.repos && results.repos.length > 0 && (
                <Command.Group heading="Repositories" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-subtle">
                  {results.repos.map((repo) => (
                    <Command.Item
                      key={repo.id}
                      value={`repo-${repo.id}`}
                      onSelect={() => go(`/repositories/${repo.owner?.login}/${repo.name}`)}
                      className={itemClass}
                    >
                      <FolderIcon className="size-4 shrink-0" />
                      <span className="truncate">{repo.full_name}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results?.issues && results.issues.length > 0 && (
                <Command.Group heading="Issues & pull requests" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-subtle">
                  {results.issues.map((item) => {
                    // repository_url looks like https://api.github.com/repos/owner/repo
                    const [owner, repo] = item.repository_url.split("/repos/")[1]?.split("/") ?? [];
                    const isPr = !!item.pull_request;
                    const href = isPr
                      ? `/repositories/${owner}/${repo}/pull/${item.number}`
                      : `/repositories/${owner}/${repo}/issues/${item.number}`;
                    return (
                      <Command.Item
                        key={item.id}
                        value={`issue-${item.id}`}
                        onSelect={() => go(href)}
                        className={itemClass}
                      >
                        {isPr ? (
                          <ArrowsRightLeftIcon className="size-4 shrink-0" />
                        ) : (
                          <ExclamationCircleIcon className="size-4 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                        <span className="ml-auto shrink-0 text-xs text-text-subtle">
                          {owner}/{repo} #{item.number}
                        </span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              )}

              <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-subtle">
                {ALL_NAV_ITEMS.filter((item) =>
                  item.label.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.href}
                      value={`nav-${item.href}`}
                      onSelect={() => go(item.href)}
                      className={itemClass}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.goKey && (
                        <span className="ml-auto flex items-center gap-0.5">
                          <Kbd>g</Kbd>
                          <Kbd>{item.goKey}</Kbd>
                        </span>
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>

              <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-text-subtle">
                <Command.Item
                  value="action-new-repo"
                  onSelect={() => go("/repositories?new=1")}
                  className={itemClass}
                >
                  <PlusIcon className="size-4 shrink-0" />
                  <span>New repository</span>
                </Command.Item>
                <Command.Item
                  value="action-new-gist"
                  onSelect={() => go("/gists?new=1")}
                  className={itemClass}
                >
                  <PlusIcon className="size-4 shrink-0" />
                  <span>New gist</span>
                </Command.Item>
                <Command.Item
                  value="action-theme"
                  onSelect={() => {
                    toggleTheme();
                    setOpen(false);
                  }}
                  className={itemClass}
                >
                  {resolvedTheme === "dark" ? (
                    <SunIcon className="size-4 shrink-0" />
                  ) : (
                    <MoonIcon className="size-4 shrink-0" />
                  )}
                  <span>Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
