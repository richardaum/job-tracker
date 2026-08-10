"use client";

import { Toast, type ToastItem } from "@job-tracker/ui";
import { type ReactNode, useCallback, useMemo, useState } from "react";

import { generateUuid } from "@/lib/generate-uuid";

import { ToastQueueContext } from "./toast-queue.context";
import { type EnqueueToastInput } from "./toast-queue.types";

type ToastQueueProviderProps = { children: ReactNode };

export function ToastQueueProvider({ children }: ToastQueueProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const enqueueToast = useCallback((input: EnqueueToastInput) => {
    const id = input.id ?? generateUuid();

    setToasts((current) => [
      ...current,
      {
        id,
        title: input.title,
        intent: input.intent ?? "info",
        description: input.description,
        lifetime: input.lifetime,
        attrs: input.attrs,
      },
    ]);

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const handleToastOpenChange = useCallback(
    (id: string, open: boolean) => {
      if (!open) dismissToast(id);
    },
    [dismissToast],
  );

  const toastProps = useMemo(
    () => ({ toasts, onToastOpenChange: handleToastOpenChange }),
    [handleToastOpenChange, toasts],
  );
  const value = useMemo(() => ({ toastProps, enqueueToast, dismissToast }), [dismissToast, enqueueToast, toastProps]);

  return (
    <ToastQueueContext.Provider value={value}>
      {children}
      <Toast {...toastProps} />
    </ToastQueueContext.Provider>
  );
}
