import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockUseAiConversationsQuery = vi.fn();
const mockUseAiMessagesQuery = vi.fn();
const mockUseCreateAiConversationMutation = vi.fn();
const mockUseDeleteAiConversationMutation = vi.fn();
const mockUseAskAiQuestionMutation = vi.fn();
const mockUseAiMessageStreamedSubscription = vi.fn();
const mockRemoveDeletedEntityFromListCache = vi.fn();

vi.mock("@/gql/hooks", () => ({
  AiConversationsDocument: { kind: "Document", definitions: [] },
  DeleteAiConversationDocument: { kind: "Document", definitions: [] },
  useAiConversationsQuery: (...args: unknown[]) => mockUseAiConversationsQuery(...args),
  useAiMessagesQuery: (...args: unknown[]) => mockUseAiMessagesQuery(...args),
  useCreateAiConversationMutation: (...args: unknown[]) => mockUseCreateAiConversationMutation(...args),
  useDeleteAiConversationMutation: (...args: unknown[]) => mockUseDeleteAiConversationMutation(...args),
  useAskAiQuestionMutation: (...args: unknown[]) => mockUseAskAiQuestionMutation(...args),
  useAiMessageStreamedSubscription: (...args: unknown[]) => mockUseAiMessageStreamedSubscription(...args),
}));

vi.mock("@/modules/jobs/shared/utils/apolloDeleteCache", () => ({
  removeDeletedEntityFromListCache: (...args: unknown[]) => mockRemoveDeletedEntityFromListCache(...args),
}));

import { useChatPanelViewModel } from "./useChatPanelViewModel";

function setupDefaultMocks() {
  mockUseAiConversationsQuery.mockReturnValue({
    data: { aiConversations: [] },
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  });
  mockUseAiMessagesQuery.mockReturnValue({
    data: { aiMessages: [] },
    loading: false,
    error: undefined,
    refetch: vi.fn().mockResolvedValue({ data: { aiMessages: [] } }),
  });
  const createConvMut = vi.fn().mockResolvedValue({
    data: {
      createAiConversation: {
        id: "conv-1",
        jobId: "job-1",
        title: "New conversation",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
    },
  });
  mockUseCreateAiConversationMutation.mockReturnValue([createConvMut, { loading: false }]);
  const deleteConvMut = vi.fn().mockResolvedValue({
    data: { deleteAiConversation: { success: true, deletedId: "conv-1" } },
  });
  mockUseDeleteAiConversationMutation.mockReturnValue([deleteConvMut, { loading: false }]);
  const askQuestionMut = vi.fn().mockResolvedValue({
    data: { askAiQuestion: { success: true } },
  });
  mockUseAskAiQuestionMutation.mockReturnValue([askQuestionMut, { loading: false }]);
  mockUseAiMessageStreamedSubscription.mockReturnValue({});
}

describe("useChatPanelViewModel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns conversations list from query", () => {
    setupDefaultMocks();

    mockUseAiConversationsQuery.mockReturnValue({
      data: {
        aiConversations: [
          { id: "conv-1", jobId: "job-1", title: "Chat 1", createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z" },
          { id: "conv-2", jobId: "job-1", title: "Chat 2", createdAt: "2025-01-02T00:00:00Z", updatedAt: "2025-01-02T00:00:00Z" },
        ],
      },
      loading: false,
      error: undefined,
    });

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.conversations[0]).toEqual({
      id: "conv-1",
      title: "Chat 1",
      createdAt: "2025-01-01T00:00:00Z",
    });
    expect(result.current.conversations[1]).toEqual({
      id: "conv-2",
      title: "Chat 2",
      createdAt: "2025-01-02T00:00:00Z",
    });
  });

  it("returns empty conversations list when no data", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    expect(result.current.conversations).toEqual([]);
  });

  it("streaming is initially false", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamingContent).toBe("");
    expect(result.current.error).toBeUndefined();
  });

  it("has no active conversation initially", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    expect(result.current.activeConversationId).toBeUndefined();
  });

  it("calls createConversation mutation and sets active conversation", async () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    await act(async () => {
      await result.current.createConversation();
    });

    const createMut = mockUseCreateAiConversationMutation.mock.results[0].value[0];
    expect(createMut).toHaveBeenCalledWith(expect.objectContaining({ variables: { jobId: "job-1" } }));
    expect(result.current.activeConversationId).toBe("conv-1");
  });

  it("calls deleteConversation mutation", async () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    await act(async () => {
      await result.current.deleteConversation("conv-1");
    });

    const deleteMut = mockUseDeleteAiConversationMutation.mock.results[0].value[0];
    expect(deleteMut).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: "conv-1" } }),
    );
    expect(result.current.activeConversationId).toBeUndefined();
  });

  it("switchConversation changes active conversation", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-42");
    });

    expect(result.current.activeConversationId).toBe("conv-42");
  });

  it("returns messages from query for active conversation", () => {
    setupDefaultMocks();

    mockUseAiMessagesQuery.mockReturnValue({
      data: {
        aiMessages: [
          { id: "msg-1", conversationId: "conv-1", role: "user", content: "Hello", createdAt: "2025-01-01T00:00:00Z" },
          { id: "msg-2", conversationId: "conv-1", role: "assistant", content: "Hi there!", createdAt: "2025-01-01T00:00:01Z" },
        ],
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      id: "msg-1",
      role: "user",
      content: "Hello",
      createdAt: "2025-01-01T00:00:00Z",
    });
    expect(result.current.messages[1]).toEqual({
      id: "msg-2",
      role: "assistant",
      content: "Hi there!",
      createdAt: "2025-01-01T00:00:01Z",
    });
  });

  it("asks question via mutation", async () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    await act(async () => {
      await result.current.askQuestion("What does this company do?");
    });

    const askMut = mockUseAskAiQuestionMutation.mock.results[0].value[0];
    expect(askMut).toHaveBeenCalledWith({
      variables: { conversationId: "conv-1", content: "What does this company do?" },
    });
  });

  it("adds optimistic user message when asking question", async () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    await act(async () => {
      await result.current.askQuestion("Hello!");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("user");
    expect(result.current.messages[0].content).toBe("Hello!");
    expect(result.current.isStreaming).toBe(true);
  });

  it("accumulates streaming tokens via subscription", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    const onDataCallback = mockUseAiMessageStreamedSubscription.mock.calls[0][0].onData;

    act(() => {
      result.current.askQuestion("Hello?");
    });

    act(() => {
      onDataCallback({
        data: {
          data: {
            aiMessageStreamed: {
              conversationId: "conv-1",
              token: "Hello",
              completed: false,
              userMessageId: null,
              aiMessageId: null,
            },
          },
        },
      });
    });

    expect(result.current.streamingContent).toBe("Hello");

    act(() => {
      onDataCallback({
        data: {
          data: {
            aiMessageStreamed: {
              conversationId: "conv-1",
              token: " world",
              completed: false,
              userMessageId: null,
              aiMessageId: null,
            },
          },
        },
      });
    });

    expect(result.current.streamingContent).toBe("Hello world");
  });

  it("handles subscription completion: clears streaming and refetches", async () => {
    const refetchMock = vi.fn().mockResolvedValue({ data: { aiMessages: [] } });

    setupDefaultMocks();
    mockUseAiMessagesQuery.mockReturnValue({
      data: { aiMessages: [] },
      loading: false,
      error: undefined,
      refetch: refetchMock,
    });

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    const onDataCallback = mockUseAiMessageStreamedSubscription.mock.calls[0][0].onData;

    await act(async () => {
      await result.current.askQuestion("Hello?");
    });

    act(() => {
      onDataCallback({
        data: {
          data: {
            aiMessageStreamed: {
              conversationId: "conv-1",
              token: null,
              completed: true,
              userMessageId: "user-msg-1",
              aiMessageId: "ai-msg-1",
            },
          },
        },
      });
    });

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamingContent).toBe("");
  });

  it("handles subscription error", () => {
    setupDefaultMocks();

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    const onErrorCallback = mockUseAiMessageStreamedSubscription.mock.calls[0][0].onError;

    act(() => {
      onErrorCallback(new Error("Stream failed"));
    });

    expect(result.current.error).toBe("Stream failed");
  });
});
