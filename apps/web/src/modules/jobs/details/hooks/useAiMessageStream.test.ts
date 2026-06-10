import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const streamOnData = vi.hoisted(() => ({
  current: null as
    | ((event: {
        data?: {
          aiMessageStreamed?: {
            phase?: import("@/gql/graphql").AiMessageStreamPhase;
            conversationId?: string;
            token?: string | null;
            userMessageId?: string | null;
            aiMessageId?: string | null;
          };
        };
      }) => void)
    | null,
}));
const streamUnsubscribe = vi.hoisted(() => vi.fn());

vi.mock("@apollo/client/react", () => ({
  useApolloClient: () => ({
    subscribe: () => ({
      subscribe: (obs: { next?: (v: unknown) => void; error?: (e: unknown) => void }) => {
        streamOnData.current = obs.next as typeof streamOnData.current;
        queueMicrotask(() => obs.next?.({ data: { aiMessageStreamed: { phase: "Ready", conversationId: "conv-1" } } }));
        return { unsubscribe: streamUnsubscribe };
      },
    }),
  }),
}));

vi.mock("@/gql/hooks", async () => {
  const { AiMessageStreamPhase } = await import("@/gql/graphql");
  return { AiMessageStreamedDocument: {}, AiMessageStreamPhase };
});

import { AiMessageStreamPhase } from "@/gql/graphql";
import { useAiMessageStream } from "./useAiMessageStream";

describe("useAiMessageStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    streamOnData.current = null;
  });

  it("starts idle with empty stream content", () => {
    const { result } = renderHook(() => useAiMessageStream());

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
  });

  it("invokes onReady when Ready phase arrives", async () => {
    const onReady = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAiMessageStream({ onReady }));

    await act(async () => {
      result.current.startStream({ conversationId: "conv-1", content: "Hi there" });
      await Promise.resolve();
    });

    expect(onReady).toHaveBeenCalledWith({ conversationId: "conv-1", content: "Hi there" });
  });

  it("accumulates tokens while streaming", async () => {
    const { result } = renderHook(() => useAiMessageStream());

    await act(async () => {
      result.current.startStream({ conversationId: "conv-1", content: "Hi" });
    });

    expect(result.current.isStreaming).toBe(true);
    expect(streamOnData.current).not.toBeNull();

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: { phase: AiMessageStreamPhase.Streaming, token: "Hello ", conversationId: "conv-1" },
        },
      });
    });

    expect(result.current.streamContent).toBe("Hello ");

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: { phase: AiMessageStreamPhase.Streaming, token: "World", conversationId: "conv-1" },
        },
      });
    });

    expect(result.current.streamContent).toBe("Hello World");
  });

  it("complete event stops streaming, clears content, and invokes onComplete", async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useAiMessageStream({ onComplete }));

    await act(async () => {
      result.current.startStream({ conversationId: "conv-1", content: "Hi" });
    });

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: { phase: AiMessageStreamPhase.Streaming, token: "Hello", conversationId: "conv-1" },
        },
      });
    });

    expect(result.current.streamContent).toBe("Hello");

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: {
            phase: AiMessageStreamPhase.Complete,
            conversationId: "conv-1",
            userMessageId: "msg-user",
            aiMessageId: "msg-ai",
          },
        },
      });
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
    expect(onComplete).toHaveBeenCalledWith({
      input: { conversationId: "conv-1", content: "Hi" },
      userMessageId: "msg-user",
      aiMessageId: "msg-ai",
      streamContent: "Hello",
    });
  });

  it("failed event resets stream and invokes onFailed", async () => {
    const onFailed = vi.fn();
    const { result } = renderHook(() => useAiMessageStream({ onFailed }));

    await act(async () => {
      result.current.startStream({ conversationId: "conv-1", content: "Hi" });
    });

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: { phase: AiMessageStreamPhase.Streaming, token: "Hello", conversationId: "conv-1" },
        },
      });
    });

    act(() => {
      streamOnData.current!({
        data: { aiMessageStreamed: { phase: AiMessageStreamPhase.Failed, conversationId: "conv-1" } },
      });
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
    expect(onFailed).toHaveBeenCalledOnce();
  });

  it("resetStream unsubscribes and clears streaming state", async () => {
    const { result } = renderHook(() => useAiMessageStream());

    await act(async () => {
      result.current.startStream({ conversationId: "conv-1", content: "Hi" });
    });

    act(() => {
      streamOnData.current!({
        data: {
          aiMessageStreamed: { phase: AiMessageStreamPhase.Streaming, token: "Hello", conversationId: "conv-1" },
        },
      });
    });

    act(() => {
      result.current.resetStream();
    });

    expect(streamUnsubscribe).toHaveBeenCalled();
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
  });
});
