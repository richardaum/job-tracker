"use client";

import { useMemo } from "react";

import { useAiConversationsQuery } from "@/gql/hooks";

export interface ChatConversationItem {
  id: string;
  title: string;
  createdAt: string;
}

/** Job-scoped AI conversation list from GraphQL. */
export function useChatConversations(jobId: string) {
  const { data, loading } = useAiConversationsQuery({ variables: { jobId } });

  const conversations = useMemo((): ChatConversationItem[] => {
    if (!data?.aiConversations) return [];
    return data.aiConversations.map((c) => ({ id: c.id, title: c.title, createdAt: c.createdAt }));
  }, [data]);

  return { conversations, loading };
}
