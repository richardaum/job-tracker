"use client";

import { type ReactNode } from "react";

import { useChatPanelViewModel } from "./useChatPanelViewModel";
import { AiChatContext } from "./AiChatContext";

type AiChatProviderProps = { jobId: string; children: ReactNode };

export function AiChatProvider({ jobId, children }: AiChatProviderProps) {
  const vm = useChatPanelViewModel(jobId);
  return <AiChatContext.Provider value={vm}>{children}</AiChatContext.Provider>;
}
