import { ApolloClient, InMemoryCache } from "@apollo/client";
import { describe, expect, it } from "vitest";

import { AiMessageRole, AiMessagesDocument } from "@/gql/hooks";

import { appendAiMessagesToCache } from "./appendAiMessagesToCache";

describe("appendAiMessagesToCache", () => {
  it("appends new messages to the AiMessages query cache", () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: { request: () => null } as never });

    client.cache.writeQuery({
      query: AiMessagesDocument,
      variables: { conversationId: "conv-1" },
      data: {
        __typename: "Query",
        aiMessages: [
          {
            __typename: "AiMessageType",
            id: "msg-1",
            conversationId: "conv-1",
            role: AiMessageRole.User,
            content: "Hello",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    appendAiMessagesToCache(client.cache, "conv-1", [
      {
        id: "msg-2",
        conversationId: "conv-1",
        role: AiMessageRole.User,
        content: "Follow up",
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "msg-3",
        conversationId: "conv-1",
        role: AiMessageRole.Assistant,
        content: "Sure thing",
        createdAt: "2024-01-02T00:01:00Z",
      },
    ]);

    const cached = client.cache.readQuery<{
      aiMessages: Array<{
        __typename: string;
        id: string;
        conversationId: string;
        role: string;
        content: string;
        createdAt: string;
      }>;
    }>({ query: AiMessagesDocument, variables: { conversationId: "conv-1" } });

    expect(cached?.aiMessages).toEqual([
      {
        __typename: "AiMessageType",
        id: "msg-1",
        conversationId: "conv-1",
        role: AiMessageRole.User,
        content: "Hello",
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        __typename: "AiMessageType",
        id: "msg-2",
        conversationId: "conv-1",
        role: AiMessageRole.User,
        content: "Follow up",
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        __typename: "AiMessageType",
        id: "msg-3",
        conversationId: "conv-1",
        role: AiMessageRole.Assistant,
        content: "Sure thing",
        createdAt: "2024-01-02T00:01:00Z",
      },
    ]);
  });

  it("deduplicates messages already present in cache", () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: { request: () => null } as never });

    client.cache.writeQuery({
      query: AiMessagesDocument,
      variables: { conversationId: "conv-1" },
      data: {
        __typename: "Query",
        aiMessages: [
          {
            __typename: "AiMessageType",
            id: "msg-1",
            conversationId: "conv-1",
            role: AiMessageRole.User,
            content: "Hello",
            createdAt: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    appendAiMessagesToCache(client.cache, "conv-1", [
      {
        id: "msg-1",
        conversationId: "conv-1",
        role: AiMessageRole.User,
        content: "Hello",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);

    const cached = client.cache.readQuery<{
      aiMessages: Array<{
        __typename: string;
        id: string;
        conversationId: string;
        role: string;
        content: string;
        createdAt: string;
      }>;
    }>({ query: AiMessagesDocument, variables: { conversationId: "conv-1" } });

    expect(cached?.aiMessages).toEqual([
      {
        __typename: "AiMessageType",
        id: "msg-1",
        conversationId: "conv-1",
        role: AiMessageRole.User,
        content: "Hello",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);
  });

  it("creates query cache data when none exists yet", () => {
    const client = new ApolloClient({ cache: new InMemoryCache(), link: { request: () => null } as never });

    appendAiMessagesToCache(client.cache, "conv-1", [
      {
        id: "msg-1",
        conversationId: "conv-1",
        role: AiMessageRole.Assistant,
        content: "Hi",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);

    const cached = client.cache.readQuery<{
      aiMessages: Array<{
        __typename: string;
        id: string;
        conversationId: string;
        role: string;
        content: string;
        createdAt: string;
      }>;
    }>({ query: AiMessagesDocument, variables: { conversationId: "conv-1" } });

    expect(cached?.aiMessages).toEqual([
      {
        __typename: "AiMessageType",
        id: "msg-1",
        conversationId: "conv-1",
        role: AiMessageRole.Assistant,
        content: "Hi",
        createdAt: "2024-01-01T00:00:00Z",
      },
    ]);
  });
});
