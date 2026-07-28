"use client";

import { FC } from "react";
import { KeyIcon, PuzzlePieceIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { useGitHub } from "../../context/GitHubContext";
import { AuthMethod } from "../../services/auth/authService";
import Tooltip from "./Tooltip";

const labels: Record<string, { text: string; icon: typeof KeyIcon; title: string }> = {
  [AuthMethod.OAUTH]: { text: "OAuth", icon: ShieldCheckIcon, title: "Signed in with GitHub OAuth" },
  [AuthMethod.PERSONAL_ACCESS_TOKEN]: {
    text: "PAT",
    icon: KeyIcon,
    title: "Using a personal access token",
  },
  [AuthMethod.GITHUB_APP]: {
    text: "App",
    icon: PuzzlePieceIcon,
    title: "Authenticated as a GitHub App",
  },
};

const AuthMethodBadge: FC = () => {
  const { authMethod } = useGitHub();
  const entry = authMethod ? labels[authMethod] : undefined;
  if (!entry) return null;

  const Icon = entry.icon;

  return (
    <Tooltip content={entry.title} side="bottom">
      <span className="hidden items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0.5 text-2xs font-medium text-text-muted sm:inline-flex">
        <Icon className="size-3" />
        {entry.text}
      </span>
    </Tooltip>
  );
};

export default AuthMethodBadge;
