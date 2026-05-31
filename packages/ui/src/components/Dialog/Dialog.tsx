import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { XIcon } from "@phosphor-icons/react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "@ui/lib/cn";

import { Separator } from "@ui/components/Separator/Separator";

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

export interface DialogProps {
  trigger?: ReactElement;
  title: string;
  children?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  childrenClassName?: string;
  size?: DialogSize;
}

const sizeClasses: Record<DialogSize, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

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
  childrenClassName,
  size = "lg",
}: DialogProps) {
  const hasDescription = typeof description === "string" ? Boolean(description.trim()) : Boolean(description);

  return (
    <RadixDialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger ? <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger> : null}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={cn("fixed inset-0 z-40 bg-(--semantic-color-overlay-backdrop)")} />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-(var(--primitive-space-6)*2))] -translate-1/2 flex-col rounded-lg border border-border-subtle bg-bg-surface p-6 shadow-md focus:outline-none",
            sizeClasses[size],
            contentClassName,
          )}
          {...(!hasDescription ? { "aria-describedby": undefined } : {})}
        >
          <div className={cn("mb-3 shrink-0 pr-10")}>
            <div className={cn("space-y-1")}>
              <RadixDialog.Title className={cn("text-md font-semibold text-text-primary")}>{title}</RadixDialog.Title>
              {hasDescription ? (
                <RadixDialog.Description asChild>
                  <div className={cn("text-sm text-text-secondary")}>{description}</div>
                </RadixDialog.Description>
              ) : null}
            </div>
          </div>
          <RadixDialog.Close
            aria-label="Close dialog"
            className={cn(
              "absolute right-5 top-5 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
            )}
          >
            <XIcon size={16} weight="regular" />
          </RadixDialog.Close>
          <div data-debug-children className={cn("flex-1 min-h-0", childrenClassName)}>
            {children}
          </div>
          {footer ? <div className={cn("mt-4 shrink-0")}>{footer}</div> : null}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export function DialogBottomActions({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("shrink-0")}>
      <div className={cn("py-4")}>
        <Separator />
      </div>
      <div className={cn("flex items-center gap-2", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

export type DialogBottomActionsProps = HTMLAttributes<HTMLDivElement>;

Dialog.BottomActions = DialogBottomActions;
