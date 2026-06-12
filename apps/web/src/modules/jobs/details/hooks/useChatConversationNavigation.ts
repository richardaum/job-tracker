"use client";

import { useCallback } from "react";

export interface ChatConversationNavigationDeps {
  isNewConversation: boolean;
  isStreaming: boolean;
  setConversationId: (id: string | null) => void;
  setIsNewConversation: (value: boolean) => void;
  resetStream: () => void;
  stopStream: () => void;
  clearPendingMessages: () => void;
}

export interface ChatConversationNavigation {
  switchConversation: (id: string | null) => void;
  startNewConversation: () => void;
}

/** Conversation list ↔ chat view navigation with stream/pending cleanup. */
export function useChatConversationNavigation({
  isNewConversation,
  isStreaming,
  setConversationId,
  setIsNewConversation,
  resetStream,
  stopStream,
  clearPendingMessages,
}: ChatConversationNavigationDeps): ChatConversationNavigation {
  const switchConversation = useCallback(
    (id: string | null) => {
      resetStream();
      clearPendingMessages();
      setConversationId(id);
      setIsNewConversation(false);
    },
    [resetStream, clearPendingMessages, setConversationId, setIsNewConversation],
  );

  const startNewConversation = useCallback((): void => {
    if (isStreaming || isNewConversation) return;
    stopStream();
    clearPendingMessages();
    setIsNewConversation(true);
    setConversationId(null);
  }, [isStreaming, isNewConversation, stopStream, clearPendingMessages, setConversationId, setIsNewConversation]);

  return { switchConversation, startNewConversation };
}
