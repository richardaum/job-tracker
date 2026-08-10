"use client";

import { Toast, type ToastIntent, type ToastItem } from "@job-tracker/ui";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { generateUuid } from "@/lib/generate-uuid";

import { ToastQueueContext } from "./toast-queue.context";

type ToastQueueProviderProps = { children: ReactNode };

export function ToastQueueProvider({ children }: ToastQueueProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const enqueueToast = useCallback(
    ({
      id,
      title,
      intent = "info",
      description,
      durationMs,
      "data-welcome-tour-step": welcomeTourStep,
    }: {
      id?: string;
      title: string;
      intent?: ToastIntent;
      description?: string;
      durationMs?: number;
      "data-welcome-tour-step"?: string;
    }) => {
      setToasts((current) => [
        ...current,
        { id: id ?? generateUuid(), title, intent, description, durationMs, "data-welcome-tour-step": welcomeTourStep },
      ]);
    },
    [],
  );

  const dismissToast = useCallback((id: string, open: boolean) => {
    if (open) return;
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toastProps = useMemo(() => ({ toasts, onToastOpenChange: dismissToast }), [dismissToast, toasts]);

  const value = useMemo(() => ({ toastProps, enqueueToast, dismissToast }), [dismissToast, enqueueToast, toastProps]);

  return (
    <ToastQueueContext.Provider value={value}>
      {children}
      <Toast {...toastProps} />
    </ToastQueueContext.Provider>
  );
}
