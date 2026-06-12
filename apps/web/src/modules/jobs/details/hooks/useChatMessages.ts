"use client";

import { useMemo } from "react";

import { type AiMessageRole, useAiMessagesQuery } from "@/gql/hooks";
import type { PendingChatMessage } from "@/modules/jobs/details/hooks/usePendingChatMessages";

export interface ChatMessageItem {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

/** Active conversation messages, merged with optimistic pending user messages. */
export function useChatMessages(
  conversationId: string | null,
  mergeWithServer: (serverMessages: PendingChatMessage[]) => PendingChatMessage[],
) {
  const {
    data: messagesData,
    loading,
    refetch: refetchMessages,
  } = useAiMessagesQuery({
    variables: { conversationId: conversationId! },
    skip: !conversationId,
    fetchPolicy: "cache-and-network",
  });

  const messages = useMemo((): ChatMessageItem[] => {
    const serverMessages = (messagesData?.aiMessages ?? []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
    return mergeWithServer(serverMessages);
  }, [messagesData, mergeWithServer]);

  return { messages, loading, refetchMessages };
}
