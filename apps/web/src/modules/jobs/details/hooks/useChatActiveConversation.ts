"use client";

import { useState } from "react";

export interface ChatActiveConversation {
  conversationId: string | null;
  isNewConversation: boolean;
  hasActiveView: boolean;
  setConversationId: (id: string | null) => void;
  setIsNewConversation: (value: boolean) => void;
}

/** Local state for the active AI chat conversation (or pre-chat draft). */
export function useChatActiveConversation(): ChatActiveConversation {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isNewConversation, setIsNewConversation] = useState(false);
  const hasActiveView = conversationId !== null || isNewConversation;

  return { conversationId, isNewConversation, hasActiveView, setConversationId, setIsNewConversation };
}
