import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";

export interface DialogProps {
  trigger: React.ReactElement;
  title: string;
  children: React.ReactNode;
  description?: string;
  footer?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
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
}: DialogProps) {
  return (
    <RadixDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-[var(--component-overlay-backdrop)]" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(var(--component-dialog-max-width),calc(100vw-(var(--semantic-space-card-padding)*2)))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border-subtle bg-bg-surface p-card-padding shadow-md focus:outline-none">
          <div className="mb-3 flex items-start justify-between gap-inline-gap">
            <div className="space-y-1">
              <RadixDialog.Title className="text-md font-semibold text-text-primary">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-sm text-text-secondary">
                  {description}
                </RadixDialog.Description>
              ) : null}
            </div>
            <RadixDialog.Close
              aria-label="Close dialog"
              className="inline-flex size-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2"
            >
              <X size={16} weight="regular" />
            </RadixDialog.Close>
          </div>
          <div>{children}</div>
          {footer ? <div className="mt-4">{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
