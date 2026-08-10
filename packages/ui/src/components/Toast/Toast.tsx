"use client";

import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XCircleIcon, XIcon } from "@phosphor-icons/react";
import { cloneElement, useEffect, useState } from "react";
import type { MouseEvent, MouseEventHandler, ReactElement, ReactNode } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { cn } from "@ui/lib/cn";

export type ToastIntent = "info" | "success" | "warning" | "error";
export type ToastAttributes = Record<`data-${string}`, string | undefined>;
export type ToastLifetime = "auto" | "manual";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  intent?: ToastIntent;
  actionLabel?: string;
  onAction?: () => void;
  open?: boolean;
  durationMs?: number;
  lifetime?: ToastLifetime;
  attrs?: ToastAttributes;
}

export interface ToastProps {
  trigger?: ReactElement<{ onClick?: MouseEventHandler }>;
  title?: string;
  description?: string;
  intent?: ToastIntent;
  actionLabel?: string;
  onAction?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  durationMs?: number;
  toasts?: ToastItem[];
  onToastOpenChange?: (id: string, open: boolean) => void;
}

const intentClasses: Record<ToastIntent, string> = {
  info: "text-text-primary",
  success: "text-text-primary",
  warning: "text-text-primary",
  error: "text-text-primary",
};

const intentIconClasses: Record<ToastIntent, string> = {
  info: "text-text-brand",
  success: "text-text-success",
  warning: "text-text-warning",
  error: "text-text-error",
};

const intentIcons: Record<ToastIntent, ReactNode> = {
  info: <InfoIcon size={18} weight="regular" />,
  success: <CheckCircleIcon size={18} weight="regular" />,
  warning: <WarningCircleIcon size={18} weight="regular" />,
  error: <XCircleIcon size={18} weight="regular" />,
};

type ToastProgressProps = { durationMs: number };

function ToastProgress({ durationMs }: ToastProgressProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setCollapsed(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      data-testid="toast-progress"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left bg-border-brand/40 transition-transform ease-linear",
      )}
      style={{ transform: collapsed ? "scaleX(0)" : "scaleX(1)", transitionDuration: `${durationMs}ms` }}
    />
  );
}

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
  durationMs = 4500,
  toasts,
  onToastOpenChange,
}: ToastProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  const triggerElement = trigger
    ? cloneElement(trigger, {
        onClick: (event: MouseEvent) => {
          trigger.props.onClick?.(event);
          handleOpenChange(true);
        },
      })
    : null;

  const queue = toasts?.length
    ? toasts
    : title
      ? [{ id: "single", title, description, intent, actionLabel, onAction, open: currentOpen } satisfies ToastItem]
      : [];

  return (
    <RadixToast.Provider swipeDirection="right">
      {queue.map((toastItem) => {
        const currentIntent = toastItem.intent ?? "info";
        const itemDurationMs =
          toastItem.lifetime === "manual" ? Number.POSITIVE_INFINITY : (toastItem.durationMs ?? durationMs);

        return (
          <RadixToast.Root
            key={toastItem.id}
            open={toastItem.open ?? true}
            duration={itemDurationMs}
            {...toastItem.attrs}
            data-testid="toast-root"
            onOpenChange={(nextOpen) => {
              if (toastItem.id === "single") {
                handleOpenChange(nextOpen);
              }
              onToastOpenChange?.(toastItem.id, nextOpen);
            }}
            className={cn(
              "relative overflow-hidden",
              "grid min-w-72 grid-cols-[auto_1fr_auto] items-start gap-2 rounded-md border border-border-subtle bg-bg-surface px-4 py-3 shadow-md",
              intentClasses[currentIntent],
            )}
          >
            <span aria-hidden className={cn("pt-0.5", intentIconClasses[currentIntent])}>
              {intentIcons[currentIntent]}
            </span>
            <div>
              <RadixToast.Title className={cn("text-sm font-semibold text-text-primary")}>
                {toastItem.title}
              </RadixToast.Title>
              {toastItem.description ? (
                <RadixToast.Description className={cn("mt-1 text-sm text-text-secondary")}>
                  {toastItem.description}
                </RadixToast.Description>
              ) : null}
              {toastItem.actionLabel ? (
                <RadixToast.Action asChild altText={toastItem.actionLabel}>
                  <button
                    type="button"
                    onClick={toastItem.onAction}
                    className={cn(
                      "mt-2 cursor-pointer rounded-sm border border-border-subtle bg-bg-surface px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
                    )}
                  >
                    {toastItem.actionLabel}
                  </button>
                </RadixToast.Action>
              ) : null}
            </div>
            <RadixToast.Close
              aria-label="Close toast"
              className={cn(
                "inline-flex size-5 self-start cursor-pointer items-center justify-center rounded-sm pt-0.5 text-text-muted transition-colors hover:bg-bg-surface-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-inset focus-visible:ring-offset-0",
              )}
            >
              <XIcon size={14} weight="regular" />
            </RadixToast.Close>
            {Number.isFinite(itemDurationMs) ? <ToastProgress durationMs={itemDurationMs} /> : null}
          </RadixToast.Root>
        );
      })}

      {triggerElement}
      <RadixToast.Viewport className={cn("fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2 outline-none")} />
    </RadixToast.Provider>
  );
}
