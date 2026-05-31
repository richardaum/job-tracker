import { type ToastIntent, type ToastProps } from "@job-tracker/ui";
import { useMemo, useState } from "react";

import { useOptionalToastQueueContext } from "./useToastQueueContext";

interface UseToastQueueReturn {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: { title: string; intent?: ToastIntent; description?: string }) => void;
  dismissToast: (id: string, open: boolean) => void;
}

export function useToastQueue(): UseToastQueueReturn {
  const context = useOptionalToastQueueContext();
  const [localToasts, setLocalToasts] = useState<NonNullable<ToastProps["toasts"]>>([]);

  function localEnqueueToast({
    title,
    intent = "info",
    description,
  }: {
    title: string;
    intent?: ToastIntent;
    description?: string;
  }) {
    setLocalToasts((current) => [...current, { id: crypto.randomUUID(), title, intent, description }]);
  }

  function localDismissToast(id: string, open: boolean) {
    if (open) return;
    setLocalToasts((current) => current.filter((toast) => toast.id !== id));
  }

  const localToastProps = useMemo(() => ({ toasts: localToasts, onToastOpenChange: localDismissToast }), [localToasts]);

  if (context) {
    return context;
  }

  return { toastProps: localToastProps, enqueueToast: localEnqueueToast, dismissToast: localDismissToast };
}
