import { type ToastIntent, type ToastProps } from "@job-tracker/ui";

export interface ToastQueueContextValue {
  toastProps: Pick<ToastProps, "toasts" | "onToastOpenChange">;
  enqueueToast: (input: { title: string; intent?: ToastIntent; description?: string }) => void;
  dismissToast: (id: string, open: boolean) => void;
}
