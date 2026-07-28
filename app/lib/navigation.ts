import {
  ArrowsRightLeftIcon,
  BeakerIcon,
  BellIcon,
  BoltIcon,
  ChartBarIcon,
  ClockIcon,
  CodeBracketIcon,
  ExclamationCircleIcon,
  EyeIcon,
  FolderIcon,
  Squares2X2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export interface NavItem {
  href: string;
  label: string;
  icon: typeof BellIcon;
  /** Keyboard sequence suffix for `g` + key jumps. */
  goKey?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Single source of truth for app navigation. The sidebar, the command palette,
 * and the go-to keyboard shortcuts all read from this list, so a destination
 * added here shows up in all three.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Squares2X2Icon, goKey: "d" },
      { href: "/activity", label: "Activity", icon: ClockIcon, goKey: "a" },
      { href: "/notifications", label: "Notifications", icon: BellIcon, goKey: "n" },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/repositories", label: "Repositories", icon: FolderIcon, goKey: "r" },
      { href: "/pull-requests", label: "Pull requests", icon: ArrowsRightLeftIcon, goKey: "p" },
      { href: "/issues", label: "Issues", icon: ExclamationCircleIcon, goKey: "i" },
      { href: "/code-review", label: "Code review", icon: EyeIcon, goKey: "v" },
      { href: "/projects", label: "Projects", icon: BeakerIcon, goKey: "j" },
      { href: "/gists", label: "Gists", icon: CodeBracketIcon, goKey: "g" },
    ],
  },
  {
    label: "Automate",
    items: [
      { href: "/automation", label: "Automation", icon: BoltIcon, goKey: "u" },
      { href: "/insights", label: "Insights", icon: ChartBarIcon },
      { href: "/team", label: "Team", icon: UserGroupIcon, goKey: "t" },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

/** True when `pathname` is the item's route or nested beneath it. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
