"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback } from "react";

import { AiConversationsDocument, DeleteAiConversationDocument, useDeleteAiConversationMutation } from "@/gql/hooks";
import { removeDeletedEntityFromListCache } from "@/modules/jobs/shared/utils/apolloDeleteCache";

export interface UseDeleteChatConversationOptions {
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  setIsNewConversation: (value: boolean) => void;
  resetStream: () => void;
  clearPendingMessages: () => void;
}

/** Deletes an AI conversation and clears local state when the active one is removed. */
export function useDeleteChatConversation({
  conversationId,
  setConversationId,
  setIsNewConversation,
  resetStream,
  clearPendingMessages,
}: UseDeleteChatConversationOptions) {
  const [deleteConversationMut] = useDeleteAiConversationMutation();

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      const [error] = await tryRun(
        deleteConversationMut({
          variables: { id },
          update: (cache, { data }) => {
            if (!data) return;
            removeDeletedEntityFromListCache(cache, {
              mutationData: data,
              mutation: DeleteAiConversationDocument,
              query: AiConversationsDocument,
            });
          },
        }),
      );
      if (error) return;
      resetStream();
      clearPendingMessages();
      if (id === conversationId) {
        setConversationId(null);
        setIsNewConversation(false);
      }
    },
    [deleteConversationMut, conversationId, resetStream, clearPendingMessages, setConversationId, setIsNewConversation],
  );

  return { deleteConversation };
}
