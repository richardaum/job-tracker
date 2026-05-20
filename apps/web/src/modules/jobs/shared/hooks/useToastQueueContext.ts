import { useContext } from "react";

import { ToastQueueContext } from "./toast-queue.context";

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
