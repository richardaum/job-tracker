"use client";

import { Toast, type ToastIntent, type ToastItem } from "@job-tracker/ui";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { ToastQueueContext } from "./toast-queue.context";

type ToastQueueProviderProps = { children: ReactNode };

export function ToastQueueProvider({ children }: ToastQueueProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const enqueueToast = useCallback(
    ({ title, intent = "info", description }: { title: string; intent?: ToastIntent; description?: string }) => {
      setToasts((current) => [...current, { id: crypto.randomUUID(), title, intent, description }]);
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
