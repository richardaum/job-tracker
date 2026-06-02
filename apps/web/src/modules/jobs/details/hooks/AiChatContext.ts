"use client";

import { createContext, useContext } from "react";

import type { UseChatPanelViewModelReturn } from "./useChatPanelViewModel";

const AiChatContext = createContext<UseChatPanelViewModelReturn | null>(null);

export function useAiChatContext(): UseChatPanelViewModelReturn {
  const ctx = useContext(AiChatContext);
  if (!ctx) throw new Error("useAiChatContext must be used within AiChatProvider");
  return ctx;
}

export { AiChatContext };
