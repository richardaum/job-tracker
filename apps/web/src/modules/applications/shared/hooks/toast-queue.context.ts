import { createContext } from "react";

import { type ToastQueueContextValue } from "./toast-queue.types";

export const ToastQueueContext = createContext<ToastQueueContextValue | null>(
  null,
);
