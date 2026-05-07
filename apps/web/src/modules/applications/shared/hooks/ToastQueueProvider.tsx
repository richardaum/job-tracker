"use client";

import {
  Toast,
  type ToastIntent,
  type ToastItem,
  type ToastProps,
} from "@job-tracker/ui";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface ToastQueueContextValue {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: {
    title: string;
    intent?: ToastIntent;
    description?: string;
  }) => void;
  dismissToast: (id: string, open: boolean) => void;
}

const ToastQueueContext = createContext<ToastQueueContextValue | null>(null);

export function ToastQueueProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const enqueueToast = useCallback(
    ({
      title,
      intent = "info",
      description,
    }: {
      title: string;
      intent?: ToastIntent;
      description?: string;
    }) => {
      setToasts((current) => [
        ...current,
        { id: crypto.randomUUID(), title, intent, description },
      ]);
    },
    [],
  );

  const dismissToast = useCallback((id: string, open: boolean) => {
    if (open) return;
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toastProps = useMemo(
    () => ({ toasts, onToastOpenChange: dismissToast }),
    [dismissToast, toasts],
  );

  const value = useMemo(
    () => ({ toastProps, enqueueToast, dismissToast }),
    [dismissToast, enqueueToast, toastProps],
  );

  return (
    <ToastQueueContext.Provider value={value}>
      {children}
      <Toast {...toastProps} />
    </ToastQueueContext.Provider>
  );
}

export function useToastQueueContext() {
  const context = useContext(ToastQueueContext);

  if (!context) {
    throw new Error("useToastQueue must be used within ToastQueueProvider");
  }

  return context;
}

export function useOptionalToastQueueContext() {
  return useContext(ToastQueueContext);
}
