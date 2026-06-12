"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback } from "react";

import { useCreateAiConversationMutation } from "@/gql/hooks";
import type { StartAiMessageStreamInput } from "@/modules/jobs/details/hooks/useAiMessageStream";

export interface UseChatSendMessageOptions {
  jobId: string;
  conversationId: string | null;
  isNewConversation: boolean;
  setConversationId: (id: string | null) => void;
  setIsNewConversation: (value: boolean) => void;
  addPendingMessage: (content: string) => string;
  removePendingMessage: (id: string) => void;
  setPendingMessageId: (id: string | null) => void;
  startStream: (input: StartAiMessageStreamInput) => void;
}

/** Sends a user message: create conversation when needed, then start AI stream. */
export function useChatSendMessage({
  jobId,
  conversationId,
  isNewConversation,
  setConversationId,
  setIsNewConversation,
  addPendingMessage,
  removePendingMessage,
  setPendingMessageId,
  startStream,
}: UseChatSendMessageOptions) {
  const [createConversationMut, { loading: isCreating }] = useCreateAiConversationMutation();

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) return;
      const tempId = addPendingMessage(content);

      let convId = conversationId;

      if (isNewConversation) {
        const [createErr, createResult] = await tryRun(createConversationMut({ variables: { jobId } }));
        if (createErr || !createResult?.data?.createAiConversation) {
          removePendingMessage(tempId);
          return;
        }
        convId = createResult.data.createAiConversation.id;
        setConversationId(convId);
        setIsNewConversation(false);
      }

      if (!convId) {
        removePendingMessage(tempId);
        return;
      }

      setPendingMessageId(tempId);
      startStream({ conversationId: convId, content });
    },
    [
      conversationId,
      isNewConversation,
      jobId,
      createConversationMut,
      addPendingMessage,
      removePendingMessage,
      setPendingMessageId,
      startStream,
      setConversationId,
      setIsNewConversation,
    ],
  );

  return { sendMessage, isCreating };
}
