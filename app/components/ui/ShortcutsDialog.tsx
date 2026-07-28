"use client";

import { ALL_NAV_ITEMS } from "../../lib/navigation";
import Kbd from "./Kbd";
import Modal from "./Modal";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GENERAL: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["/"], label: "Search" },
  { keys: ["?"], label: "Show this cheatsheet" },
  { keys: ["esc"], label: "Close dialog or menu" },
];

const LISTS: { keys: string[]; label: string }[] = [
  { keys: ["j"], label: "Next item" },
  { keys: ["k"], label: "Previous item" },
  { keys: ["enter"], label: "Open item" },
  { keys: ["x"], label: "Toggle selection" },
];

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="flex shrink-0 items-center gap-0.5">
        {keys.map((key) => (
          <Kbd key={key}>{key}</Kbd>
        ))}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-1 text-2xs font-medium uppercase tracking-wider text-text-subtle">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export default function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const jumps = ALL_NAV_ITEMS.filter((item) => item.goKey);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Keyboard shortcuts" size="lg">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-6">
          <Section title="General">
            {GENERAL.map((row) => (
              <Row key={row.label} {...row} />
            ))}
          </Section>
          <Section title="Lists">
            {LISTS.map((row) => (
              <Row key={row.label} {...row} />
            ))}
          </Section>
        </div>
        <Section title="Jump to">
          {jumps.map((item) => (
            <Row key={item.href} keys={["g", item.goKey!]} label={item.label} />
          ))}
        </Section>
      </div>
    </Modal>
  );
}
