"use client";

import { useCallback, useMemo } from "react";

import { type AiMessageRole } from "@/gql/hooks";
import { useChatActiveConversation } from "@/modules/jobs/details/hooks/useChatActiveConversation";
import { useChatAiStreamSync } from "@/modules/jobs/details/hooks/useChatAiStreamSync";
import { useChatConversationNavigation } from "@/modules/jobs/details/hooks/useChatConversationNavigation";
import { useChatConversations } from "@/modules/jobs/details/hooks/useChatConversations";
import { useChatMessages } from "@/modules/jobs/details/hooks/useChatMessages";
import { useChatSendMessage } from "@/modules/jobs/details/hooks/useChatSendMessage";
import { useDeleteChatConversation } from "@/modules/jobs/details/hooks/useDeleteChatConversation";
import { usePendingChatMessages } from "@/modules/jobs/details/hooks/usePendingChatMessages";

export interface ChatPanelViewModel {
  conversations: Array<{ id: string; title: string; createdAt: string }>;
  activeConversationId: string | null;
  isNewConversation: boolean;
  conversationTitle: string;
  hasActiveView: boolean;
  messages: Array<{ id: string; role: AiMessageRole; content: string; createdAt: string }>;
  loading: boolean;
  conversationsLoading: boolean;
  isCreating: boolean;
  isStreaming: boolean;
  isSending: boolean;
  streamContent: string;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  switchConversation: (id: string | null) => void;
  startNewConversation: () => void;
  stopStreaming: () => void;
}

/** View model for job AI chat: conversations, messages, streaming, and mutations. */
export function useChatPanelViewModel(jobId: string): ChatPanelViewModel {
  const pending = usePendingChatMessages();
  const { conversations, loading: conversationsLoading } = useChatConversations(jobId);
  const { conversationId, isNewConversation, hasActiveView, setConversationId, setIsNewConversation } =
    useChatActiveConversation();

  const {
    messages,
    loading: messagesLoading,
    refetchMessages,
  } = useChatMessages(conversationId, pending.mergeWithServer);

  const { streamContent, isStreaming, startStream, stopStream, resetStream } = useChatAiStreamSync({
    pending,
    refetchMessages,
  });

  const { switchConversation, startNewConversation } = useChatConversationNavigation({
    isNewConversation,
    isStreaming,
    setConversationId,
    setIsNewConversation,
    resetStream,
    stopStream,
    clearPendingMessages: pending.clear,
  });

  const { sendMessage, isCreating } = useChatSendMessage({
    jobId,
    conversationId,
    isNewConversation,
    setConversationId,
    setIsNewConversation,
    addPendingMessage: pending.add,
    removePendingMessage: pending.remove,
    setPendingMessageId: pending.setCurrentId,
    startStream,
  });

  const { deleteConversation } = useDeleteChatConversation({
    conversationId,
    setConversationId,
    setIsNewConversation,
    resetStream,
    clearPendingMessages: pending.clear,
  });

  const conversationTitle = useMemo(() => {
    if (!conversationId) return "";
    return conversations.find((c) => c.id === conversationId)?.title ?? "";
  }, [conversations, conversationId]);

  const loading = conversationsLoading || (!!conversationId && messagesLoading);
  const isSending = isCreating || isStreaming;

  const stopStreaming = useCallback((): void => {
    resetStream();
  }, [resetStream]);

  return {
    conversations,
    activeConversationId: conversationId,
    isNewConversation,
    conversationTitle,
    hasActiveView,
    messages,
    loading,
    conversationsLoading,
    isCreating,
    isStreaming,
    isSending,
    streamContent,
    sendMessage,
    deleteConversation,
    switchConversation,
    startNewConversation,
    stopStreaming,
  };
}
