import {
  CheckCircleIcon,
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as RadixToast from "@radix-ui/react-toast";
import { cn } from "@ui/lib/cn";
import React from "react";

export type ToastIntent = "info" | "success" | "warning" | "error";

export interface ToastProps {
  trigger: React.ReactElement<{ onClick?: React.MouseEventHandler }>;
  title: string;
  description?: string;
  intent?: ToastIntent;
  actionLabel?: string;
  onAction?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const intentClasses: Record<ToastIntent, string> = {
  info: "border-border-brand bg-bg-brand-subtle text-text-brand",
  success: "border-border-default bg-bg-success-subtle text-text-success",
  warning: "border-border-default bg-bg-warning-subtle text-text-warning",
  error: "border-border-error bg-bg-error-subtle text-text-error",
};

const intentIcons: Record<ToastIntent, React.ReactNode> = {
  info: <InfoIcon size={18} weight="regular" />,
  success: <CheckCircleIcon size={18} weight="regular" />,
  warning: <WarningCircleIcon size={18} weight="regular" />,
  error: <XCircleIcon size={18} weight="regular" />,
};

export function Toast({
  trigger,
  title,
  description,
  intent = "info",
  actionLabel,
  onAction,
  open,
  defaultOpen,
  onOpenChange,
}: ToastProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  const triggerElement = React.cloneElement(trigger, {
    onClick: (event: React.MouseEvent) => {
      trigger.props.onClick?.(event);
      handleOpenChange(true);
    },
  });

  return (
    <RadixToast.Provider swipeDirection="right">
      <RadixToast.Root
        open={currentOpen}
        onOpenChange={handleOpenChange}
        className={cn(
          "grid min-w-72 grid-cols-[auto_1fr_auto] items-start gap-2 rounded-md border p-6 shadow-md",
          intentClasses[intent],
        )}
      >
        <span aria-hidden className={cn("pt-0.5")}>
          {intentIcons[intent]}
        </span>
        <div>
          <RadixToast.Title
            className={cn("text-sm font-semibold text-current")}
          >
            {title}
          </RadixToast.Title>
          {description ? (
            <RadixToast.Description
              className={cn("mt-1 text-sm text-current/90")}
            >
              {description}
            </RadixToast.Description>
          ) : null}
          {actionLabel ? (
            <RadixToast.Action asChild altText={actionLabel}>
              <button
                type="button"
                onClick={onAction}
                className={cn(
                  "mt-2 rounded-sm border border-border-subtle bg-bg-surface px-5 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
                )}
              >
                {actionLabel}
              </button>
            </RadixToast.Action>
          ) : null}
        </div>
        <RadixToast.Close
          aria-label="Close toast"
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-sm text-current/80 transition-colors hover:bg-current/10 hover:text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
          )}
        >
          <XIcon size={14} weight="regular" />
        </RadixToast.Close>
      </RadixToast.Root>

      {triggerElement}
      <RadixToast.Viewport
        className={cn(
          "fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 outline-none",
        )}
      />
    </RadixToast.Provider>
  );
}
