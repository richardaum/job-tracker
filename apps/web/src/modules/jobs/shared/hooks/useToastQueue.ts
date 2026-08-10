import { type ToastIntent, type ToastProps } from "@job-tracker/ui";
import { useMemo, useState } from "react";

import { generateUuid } from "@/lib/generate-uuid";
import { useOptionalToastQueueContext } from "./useToastQueueContext";

export interface EnqueueToastInput {
  id?: string;
  title: string;
  intent?: ToastIntent;
  description?: string;
  durationMs?: number;
  "data-welcome-tour-step"?: string;
}

interface UseToastQueueReturn {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: EnqueueToastInput) => void;
  dismissToast: (id: string, open: boolean) => void;
}

export function useToastQueue(): UseToastQueueReturn {
  const context = useOptionalToastQueueContext();
  const [localToasts, setLocalToasts] = useState<NonNullable<ToastProps["toasts"]>>([]);

  function localEnqueueToast({
    id,
    title,
    intent = "info",
    description,
    durationMs,
    "data-welcome-tour-step": welcomeTourStep,
  }: EnqueueToastInput) {
    setLocalToasts((current) => [
      ...current,
      { id: id ?? generateUuid(), title, intent, description, durationMs, "data-welcome-tour-step": welcomeTourStep },
    ]);
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
