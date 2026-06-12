"use client";

import { useApolloClient } from "@apollo/client/react";
import { tryRun } from "@job-tracker/try-run";

import { AiMessageRole, useAskAiQuestionMutation } from "@/gql/hooks";
import { useAiMessageStream } from "@/modules/jobs/details/hooks/useAiMessageStream";
import type { PendingChatMessages } from "@/modules/jobs/details/hooks/usePendingChatMessages";
import { appendAiMessagesToCache } from "@/modules/jobs/details/utils/appendAiMessagesToCache";

export interface UseChatAiStreamSyncOptions {
  pending: Pick<PendingChatMessages, "currentIdRef" | "remove" | "clear">;
  refetchMessages: () => void;
}

/** AI message stream wired to ask mutation, Apollo cache, and pending rollback. */
export function useChatAiStreamSync({ pending, refetchMessages }: UseChatAiStreamSyncOptions) {
  const client = useApolloClient();
  const [askQuestion] = useAskAiQuestionMutation();

  return useAiMessageStream({
    onReady: async ({ conversationId, content }) => {
      const pendingId = pending.currentIdRef.current;
      const [error, result] = await tryRun(askQuestion({ variables: { conversationId, content } }));
      if (error || !result?.data?.askAiQuestion?.success) {
        if (pendingId) pending.remove(pendingId);
        throw error ?? new Error("Failed to ask AI question");
      }
    },
    onComplete: ({ input, userMessageId, aiMessageId, streamContent: assistantContent }) => {
      if (userMessageId && aiMessageId && assistantContent) {
        const syncedAt = new Date().toISOString();
        appendAiMessagesToCache(client.cache, input.conversationId, [
          {
            id: userMessageId,
            conversationId: input.conversationId,
            role: AiMessageRole.User,
            content: input.content,
            createdAt: syncedAt,
          },
          {
            id: aiMessageId,
            conversationId: input.conversationId,
            role: AiMessageRole.Assistant,
            content: assistantContent,
            createdAt: syncedAt,
          },
        ]);
      }
      pending.clear();
      void refetchMessages();
    },
    onFailed: pending.clear,
  });
}
