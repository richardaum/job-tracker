"use client";

import { tryRun } from "@job-tracker/try-run";
import { useCallback, useMemo, useState } from "react";

import {
  AiConversationsDocument,
  DeleteAiConversationDocument,
  useAiConversationsQuery,
  useAiMessageStreamedSubscription,
  useAiMessagesQuery,
  useAskAiQuestionMutation,
  useCreateAiConversationMutation,
  useDeleteAiConversationMutation,
} from "@/gql/hooks";
import type { Conversation } from "@/modules/jobs/details/components/ChatPanelConversationList";
import type { ChatMessage } from "@/modules/jobs/details/components/ChatPanelMessageList";
import { removeDeletedEntityFromListCache } from "@/modules/jobs/shared/utils/apolloDeleteCache";

export function useChatPanelViewModel(jobId: string) {

  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useAiConversationsQuery({
    variables: { jobId },
    fetchPolicy: "cache-and-network",
  });

  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);

  const {
    data: messagesData,
    refetch: refetchMessages,
  } = useAiMessagesQuery({
    variables: { conversationId: activeConversationId! },
    skip: !activeConversationId,
    fetchPolicy: "cache-and-network",
  });

  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | undefined>();
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  const [createConversationMut, { loading: isCreatingConversation }] = useCreateAiConversationMutation();
  const [deleteConversationMut] = useDeleteAiConversationMutation();
  const [askQuestionMut] = useAskAiQuestionMutation();

  useAiMessageStreamedSubscription({
    variables: { conversationId: activeConversationId! },
    skip: !activeConversationId,
    onData: ({ data }) => {
      const event = data.data?.aiMessageStreamed;
      if (!event) return;

      if (event.completed) {
        setIsStreaming(false);
        setStreamingContent("");
        void refetchConversations();
        void refetchMessages().then(() => {
          setOptimisticMessages([]);
        });
        return;
      }

      if (event.token) {
        setStreamingContent((prev) => prev + event.token);
      }
    },
    onError: (err) => {
      setIsStreaming(false);
      setStreamingContent("");
      setStreamError(err.message);
    },
  });

  const createConversation = useCallback(async (): Promise<string | undefined> => {
    const [err, result] = await tryRun(
      createConversationMut({
        variables: { jobId },
        refetchQueries: [{ query: AiConversationsDocument, variables: { jobId } }],
      }),
    );
    if (err || !result?.data?.createAiConversation) return;
    setActiveConversationId(result.data.createAiConversation.id);
    return result.data.createAiConversation.id;
  }, [createConversationMut, jobId]);

  const deleteConversation = useCallback(
    async (id: string) => {
      const [err] = await tryRun(
        deleteConversationMut({
          variables: { id },
          update: (cache, { data }) => {
            removeDeletedEntityFromListCache(cache, {
              mutationData: data,
              mutation: DeleteAiConversationDocument,
              query: AiConversationsDocument,
            });
          },
        }),
      );
      if (err) return;
      if (activeConversationId === id) {
        setActiveConversationId(undefined);
        setIsStreaming(false);
        setStreamingContent("");
        setStreamError(undefined);
        setOptimisticMessages([]);
      }
    },
    [deleteConversationMut, activeConversationId],
  );

  const askQuestion = useCallback(
    async (content: string) => {
      if (!activeConversationId) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      setOptimisticMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);
      setStreamingContent("");
      setStreamError(undefined);

      const [err] = await tryRun(
        askQuestionMut({
          variables: { conversationId: activeConversationId, content },
        }),
      );

      if (err) {
        setIsStreaming(false);
        setStreamingContent("");
        setStreamError(err.message);
      }
    },
    [askQuestionMut, activeConversationId],
  );

  const switchConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setIsStreaming(false);
    setStreamingContent("");
    setStreamError(undefined);
    setOptimisticMessages([]);
  }, []);

  const conversations: Conversation[] = useMemo(() => {
    return (conversationsData?.aiConversations ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
    }));
  }, [conversationsData]);

  const messages: ChatMessage[] = useMemo(() => {
    const persisted = (messagesData?.aiMessages ?? []).map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt,
    }));

    if (persisted.length > 0 && optimisticMessages.length === 0) {
      return persisted;
    }

    return [...persisted, ...optimisticMessages];
  }, [messagesData, optimisticMessages]);

  const error = conversationsError?.message ?? streamError;

  return {
    conversations,
    conversationsLoading,
    activeConversationId,
    messages,
    isStreaming,
    streamingContent,
    isCreatingConversation,
    error,
    createConversation,
    deleteConversation,
    askQuestion,
    switchConversation,
  };
}

export type UseChatPanelViewModelReturn = ReturnType<typeof useChatPanelViewModel>;
