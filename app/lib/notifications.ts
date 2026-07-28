import {
  ArrowsRightLeftIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ExclamationCircleIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import type { GitHubNotification } from "../types/github";

interface Presentation {
  icon: typeof BellIcon;
  /** Token-based text color class for the icon. */
  tone: string;
  label: string;
}

const BY_TYPE: Record<string, Presentation> = {
  Issue: { icon: ExclamationCircleIcon, tone: "text-success", label: "Issue" },
  PullRequest: { icon: ArrowsRightLeftIcon, tone: "text-merged", label: "Pull request" },
  Discussion: { icon: ChatBubbleLeftRightIcon, tone: "text-info", label: "Discussion" },
  Release: { icon: TagIcon, tone: "text-warning", label: "Release" },
};

export function notificationPresentation(type: string): Presentation {
  return BY_TYPE[type] ?? { icon: BellIcon, tone: "text-text-subtle", label: type };
}

/**
 * In-app route for a notification. GitHub gives an API URL for the subject, so
 * the resource number is taken from its last segment.
 */
export function notificationHref(notification: GitHubNotification): string {
  const { owner, name } = notification.repository;
  const base = `/repositories/${owner.login}/${name}`;
  const number = notification.subject.url?.split("/").pop();
  if (!number || !/^\d+$/.test(number)) return base;

  switch (notification.subject.type) {
    case "Issue":
      return `${base}/issues/${number}`;
    case "PullRequest":
      return `${base}/pull/${number}`;
    case "Discussion":
      return `${base}/discussions/${number}`;
    default:
      return base;
  }
}
