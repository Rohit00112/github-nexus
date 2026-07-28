"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "../../lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const pixels: Record<Size, number> = { xs: 16, sm: 20, md: 24, lg: 32, xl: 48 };

interface AvatarProps {
  src?: string | null;
  /** Used for the alt text and the initials fallback. */
  name?: string | null;
  size?: Size;
  className?: string;
  /** Renders as a rounded square instead of a circle (used for orgs). */
  square?: boolean;
}

export default function Avatar({ src, name, size = "md", className, square }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const px = pixels[size];
  const initials = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const shape = square ? "rounded-md" : "rounded-full";

  if (!src || failed) {
    return (
      <span
        aria-label={name ?? undefined}
        className={cn(
          "inline-flex shrink-0 items-center justify-center border border-border bg-surface-hover font-medium text-text-muted",
          shape,
          size === "xs" || size === "sm" ? "text-2xs" : "text-xs",
          className
        )}
        style={{ width: px, height: px }}
      >
        {initials}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name ?? "Avatar"}
      width={px}
      height={px}
      onError={() => setFailed(true)}
      className={cn("shrink-0 border border-border object-cover", shape, className)}
      style={{ width: px, height: px }}
    />
  );
}

/** Overlapping avatar row for contributor / assignee lists. */
export function AvatarGroup({
  users,
  size = "sm",
  max = 4,
  className,
}: {
  users: { src?: string | null; name?: string | null }[];
  size?: Size;
  max?: number;
  className?: string;
}) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((user, i) => (
        <Avatar
          key={`${user.name}-${i}`}
          src={user.src}
          name={user.name}
          size={size}
          className="-ml-1 ring-2 ring-bg first:ml-0"
        />
      ))}
      {overflow > 0 && (
        <span className="-ml-1 inline-flex items-center rounded-full border border-border bg-surface px-1.5 text-2xs text-text-muted ring-2 ring-bg">
          +{overflow}
        </span>
      )}
    </div>
  );
}
