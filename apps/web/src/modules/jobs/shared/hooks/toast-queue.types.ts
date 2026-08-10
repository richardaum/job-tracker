import { type ToastAttributes, type ToastIntent, type ToastLifetime, type ToastProps } from "@job-tracker/ui";

export interface EnqueueToastInput {
  id?: string;
  title: string;
  intent?: ToastIntent;
  description?: string;
  lifetime?: ToastLifetime;
  attrs?: ToastAttributes;
}

export interface ToastQueueContextValue {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: EnqueueToastInput) => string;
  dismissToast: (id: string) => void;
}
