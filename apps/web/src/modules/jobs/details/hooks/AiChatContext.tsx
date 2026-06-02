"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useChatPanelViewModel, type UseChatPanelViewModelReturn } from "./useChatPanelViewModel";

const AiChatContext = createContext<UseChatPanelViewModelReturn | null>(null);

type AiChatProviderProps = { jobId: string; children: ReactNode };

export function AiChatProvider({ jobId, children }: AiChatProviderProps) {
  const vm = useChatPanelViewModel(jobId);
  return <AiChatContext.Provider value={vm}>{children}</AiChatContext.Provider>;
}

export function useAiChatContext(): UseChatPanelViewModelReturn {
  const ctx = useContext(AiChatContext);
  if (!ctx) throw new Error("useAiChatContext must be used within AiChatProvider");
  return ctx;
}
