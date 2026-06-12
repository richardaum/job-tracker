import type { ApolloCache } from "@apollo/client";

import { AiMessagesDocument, type AiMessageRole, type AiMessagesQuery } from "@/gql/hooks";

export type AiMessageCacheEntry = {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
};

/** Appends new AI messages to the Apollo cache for a conversation. */
export function appendAiMessagesToCache(
  cache: ApolloCache,
  conversationId: string,
  messages: AiMessageCacheEntry[],
): void {
  if (messages.length === 0) return;

  cache.updateQuery<AiMessagesQuery>({ query: AiMessagesDocument, variables: { conversationId } }, (existing) => {
    const current = existing?.aiMessages ?? [];
    const existingIds = new Set(current.map((message) => message.id));
    const toAppend = messages
      .filter((message) => !existingIds.has(message.id))
      .map((message) => ({ __typename: "AiMessageType" as const, ...message }));

    if (toAppend.length === 0) {
      return existing;
    }

    return { __typename: "Query" as const, aiMessages: [...current, ...toAppend] };
  });
}
