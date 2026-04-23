import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { XIcon } from "@phosphor-icons/react";
import { cn } from "@ui/lib/cn";

export interface DialogProps {
  trigger: React.ReactElement;
  title: string;
  children?: React.ReactNode;
  description?: string;
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
}

export function Dialog({
  trigger,
  title,
  children,
  description,
  footer,
  open,
  defaultOpen,
  onOpenChange,
  contentClassName,
}: DialogProps) {
  return (
    <RadixDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-(--semantic-color-overlay-backdrop)",
          )}
        />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-(var(--primitive-space-6)*2))] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-md focus:outline-none",
            contentClassName,
          )}
        >
          <div className={cn("mb-3 flex items-start justify-between gap-2")}>
            <div className={cn("space-y-1")}>
              <RadixDialog.Title
                className={cn("text-md font-semibold text-text-primary")}
              >
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description
                  className={cn("text-sm text-text-secondary")}
                >
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label="Close dialog"
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
              )}
            >
              <XIcon size={16} weight="regular" />
            </RadixDialog.Close>
          </div>
          <div>{children}</div>
          {footer ? <div className={cn("mt-4")}>{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
