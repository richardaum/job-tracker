import { type ToastProps } from "@job-tracker/ui";
import { useMemo, useState } from "react";

import { generateUuid } from "@/lib/generate-uuid";
import { useOptionalToastQueueContext } from "./useToastQueueContext";
import { type EnqueueToastInput } from "./toast-queue.types";

interface UseToastQueueReturn {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: EnqueueToastInput) => string;
  dismissToast: (id: string) => void;
}

export function useToastQueue(): UseToastQueueReturn {
  const context = useOptionalToastQueueContext();
  const [localToasts, setLocalToasts] = useState<NonNullable<ToastProps["toasts"]>>([]);

  function localEnqueueToast({ id, title, intent = "info", description, lifetime, attrs }: EnqueueToastInput) {
    const toastId = id ?? generateUuid();

    setLocalToasts((current) => [...current, { id: toastId, title, intent, description, lifetime, attrs }]);

    return toastId;
  }

  function localDismissToast(id: string) {
    setLocalToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function handleLocalToastOpenChange(id: string, open: boolean) {
    if (!open) localDismissToast(id);
  }

  const localToastProps = useMemo(
    () => ({ toasts: localToasts, onToastOpenChange: handleLocalToastOpenChange }),
    [localToasts],
  );

  if (context) return context;

  return { toastProps: localToastProps, enqueueToast: localEnqueueToast, dismissToast: localDismissToast };
}
