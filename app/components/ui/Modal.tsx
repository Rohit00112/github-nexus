"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "../../lib/cn";

type Size = "sm" | "md" | "lg" | "xl";

const sizes: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Rendered in the footer, right-aligned. */
  footer?: React.ReactNode;
  size?: Size;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Dialog with focus trap, ESC + overlay dismiss, and scroll lock from Radix.
 * Body scrolls independently so long forms stay usable on short viewports.
 */
export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  size = "md",
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-elevated shadow-2xl shadow-black/40 animate-scale-in",
            sizes[size],
            className
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
              <div className="min-w-0">
                {title && (
                  <Dialog.Title className="text-sm font-semibold text-text">{title}</Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-0.5 text-xs text-text-muted">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close
                aria-label="Close"
                className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-text-subtle hover:bg-surface-hover hover:text-text"
              >
                <XMarkIcon className="size-4" />
              </Dialog.Close>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ModalClose = Dialog.Close;
