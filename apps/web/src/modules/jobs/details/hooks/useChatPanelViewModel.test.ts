import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockConversationsQuery = vi.hoisted(() => vi.fn());
const mockMessagesQuery = vi.hoisted(() => vi.fn());
const mockCreateConversationMut = vi.hoisted(() => vi.fn(() => [vi.fn(), { loading: false }]));
const mockDeleteConversationMut = vi.hoisted(() => vi.fn(() => [vi.fn(), { loading: false }]));
const mockAskQuestionMut = vi.hoisted(() => vi.fn(() => [vi.fn(), { loading: false }]));

const mockTryRun = vi.hoisted(() => vi.fn());
const mockRemoveDeletedFromCache = vi.hoisted(() => vi.fn());
const mockAppendAiMessagesToCache = vi.hoisted(() => vi.fn());
const mockApolloCache = vi.hoisted(() => ({}));
const mockUseApolloClient = vi.hoisted(() => vi.fn(() => ({ cache: mockApolloCache })));

const mockStartStream = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockStopStream = vi.hoisted(() => vi.fn());
const mockResetStream = vi.hoisted(() => vi.fn());
const mockUseAiMessageStream = vi.hoisted(() =>
  vi.fn(() => ({
    streamContent: "",
    isStreaming: false,
    startStream: mockStartStream,
    stopStream: mockStopStream,
    resetStream: mockResetStream,
  })),
);

vi.mock("@/gql/hooks", async () => {
  const { AiMessageStreamPhase } = await import("@/gql/graphql");
  return {
    useAiConversationsQuery: mockConversationsQuery,
    useAiMessagesQuery: mockMessagesQuery,
    useCreateAiConversationMutation: mockCreateConversationMut,
    useDeleteAiConversationMutation: mockDeleteConversationMut,
    useAskAiQuestionMutation: mockAskQuestionMut,
    AiConversationsDocument: {},
    AiMessagesDocument: {},
    DeleteAiConversationDocument: {},
    AiMessageRole: { User: "User", Assistant: "Assistant" },
    AiMessageStreamPhase,
  };
});

vi.mock("@job-tracker/try-run", () => ({ tryRun: mockTryRun }));
vi.mock("@apollo/client/react", () => ({ useApolloClient: mockUseApolloClient }));
vi.mock("@/modules/jobs/details/utils/appendAiMessagesToCache", () => ({
  appendAiMessagesToCache: mockAppendAiMessagesToCache,
}));
vi.mock("@/modules/jobs/shared/utils/apolloDeleteCache", () => ({
  removeDeletedEntityFromListCache: mockRemoveDeletedFromCache,
}));
vi.mock("@/modules/jobs/details/hooks/useAiMessageStream", () => ({ useAiMessageStream: mockUseAiMessageStream }));

import { useChatPanelViewModel } from "./useChatPanelViewModel";

const MOCK_CONVERSATIONS = [
  {
    __typename: "AiConversationType",
    id: "conv-1",
    jobId: "job-1",
    title: "Second conv",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    __typename: "AiConversationType",
    id: "conv-2",
    jobId: "job-1",
    title: "First conv",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

describe("useChatPanelViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAiMessageStream.mockReturnValue({
      streamContent: "",
      isStreaming: false,
      startStream: mockStartStream,
      stopStream: mockStopStream,
      resetStream: mockResetStream,
    });
    mockStartStream.mockResolvedValue(undefined);

    mockConversationsQuery.mockReturnValue({ data: { aiConversations: MOCK_CONVERSATIONS }, loading: false });

    mockMessagesQuery.mockReturnValue({ data: null, loading: false, refetch: vi.fn() });

    mockCreateConversationMut.mockReturnValue([vi.fn(), { loading: false }]);
    mockDeleteConversationMut.mockReturnValue([vi.fn(), { loading: false }]);
    mockAskQuestionMut.mockReturnValue([
      vi.fn().mockResolvedValue({ data: { askAiQuestion: { success: true } } }),
      { loading: false },
    ]);

    mockTryRun.mockRejectedValue(new Error("unexpected tryRun call"));
  });

  it("activeConversationId starts null", () => {
    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.activeConversationId).toBeNull();
  });

  it("conversations are sorted by createdAt desc", () => {
    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.conversations).toHaveLength(2);
    expect(result.current.conversations[0].id).toBe("conv-1");
    expect(result.current.conversations[1].id).toBe("conv-2");
  });

  it("conversations returns empty array when no data", () => {
    mockConversationsQuery.mockReturnValue({ data: null, loading: false });
    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.conversations).toEqual([]);
  });

  it("messages are empty when no active conversation", () => {
    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.messages).toEqual([]);
  });

  it("isNewConversation starts false", () => {
    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.isNewConversation).toBe(false);
  });

  describe("switchConversation", () => {
    it("sets active conversation id", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      expect(result.current.activeConversationId).toBe("conv-1");
      expect(result.current.isNewConversation).toBe(false);
    });

    it("null returns to list view", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      act(() => {
        result.current.switchConversation(null);
      });

      expect(result.current.activeConversationId).toBeNull();
    });

    it("resets stream state and isNewConversation", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(true);

      act(() => {
        result.current.switchConversation("conv-1");
      });

      expect(result.current.activeConversationId).toBe("conv-1");
      expect(result.current.isNewConversation).toBe(false);
      expect(mockResetStream).toHaveBeenCalled();
    });
  });

  describe("sendMessage", () => {
    it("empty content is no-op", async () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      await act(async () => {
        await result.current.sendMessage("");
      });

      expect(mockStartStream).not.toHaveBeenCalled();
      expect(result.current.activeConversationId).toBeNull();
    });

    it("whitespace-only content is no-op", async () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      await act(async () => {
        await result.current.sendMessage("   ");
      });

      expect(mockStartStream).not.toHaveBeenCalled();
      expect(result.current.activeConversationId).toBeNull();
    });

    it("with existing conversation asks question and streams", async () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(mockStartStream).toHaveBeenCalledWith({ conversationId: "conv-1", content: "Hello" });
    });

    it("with isNewConversation creates then asks", async () => {
      mockTryRun.mockResolvedValueOnce([
        null,
        { data: { createAiConversation: { id: "new-conv-1", title: "New", createdAt: "2024-01-03T00:00:00Z" } } },
      ]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(true);

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.isNewConversation).toBe(false);
      expect(result.current.activeConversationId).toBe("new-conv-1");
      expect(mockStartStream).toHaveBeenCalledWith({ conversationId: "new-conv-1", content: "Hello" });
    });

    it("create failure in isNewConversation does not proceed to ask", async () => {
      mockTryRun.mockResolvedValueOnce([new Error("create failed"), null]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.startNewConversation();
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(mockStartStream).not.toHaveBeenCalled();
    });

    it("no-op when no active conversation", async () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(mockStartStream).not.toHaveBeenCalled();
    });
  });

  describe("startNewConversation", () => {
    it("sets isNewConversation=true", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(true);
      expect(result.current.activeConversationId).toBeNull();
    });

    it("guarded when already in pre-chat", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(true);

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(true);
    });

    it("guarded when streaming", async () => {
      mockUseAiMessageStream.mockReturnValue({
        streamContent: "Hello",
        isStreaming: true,
        startStream: mockStartStream,
        stopStream: mockStopStream,
        resetStream: mockResetStream,
      });
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      expect(result.current.isStreaming).toBe(true);

      act(() => {
        result.current.startNewConversation();
      });

      expect(result.current.isNewConversation).toBe(false);
      expect(result.current.activeConversationId).toBe("conv-1");
    });
  });

  describe("deleteConversation", () => {
    it("clears activeConversationId when deleted was active", async () => {
      const mutateFn = vi.fn().mockImplementation((options: { update?: (c: unknown, r: unknown) => void }) => {
        const mutationResult = { data: { deleteAiConversation: { success: true, deletedId: "conv-1" } } };
        return Promise.resolve(mutationResult).then((result) => {
          options.update?.({} as unknown, mutationResult);
          return result;
        });
      });
      mockDeleteConversationMut.mockReturnValue([mutateFn, { loading: false }]);
      mockTryRun.mockImplementation(async (promise: Promise<unknown>) => {
        try {
          const result = await promise;
          return [null, result];
        } catch (e) {
          return [e instanceof Error ? e : new Error(String(e)), null];
        }
      });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.deleteConversation("conv-1");
      });

      expect(result.current.activeConversationId).toBeNull();
      expect(mockRemoveDeletedFromCache).toHaveBeenCalled();
      expect(mockResetStream).toHaveBeenCalled();
    });

    it("does not clear active when deleted different conversation", async () => {
      const mutateFn = vi.fn().mockImplementation((options: { update?: (c: unknown, r: unknown) => void }) => {
        const mutationResult = { data: { deleteAiConversation: { success: true, deletedId: "conv-2" } } };
        return Promise.resolve(mutationResult).then((result) => {
          options.update?.({} as unknown, mutationResult);
          return result;
        });
      });
      mockDeleteConversationMut.mockReturnValue([mutateFn, { loading: false }]);
      mockTryRun.mockImplementation(async (promise: Promise<unknown>) => {
        try {
          const result = await promise;
          return [null, result];
        } catch (e) {
          return [e instanceof Error ? e : new Error(String(e)), null];
        }
      });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.deleteConversation("conv-2");
      });

      expect(result.current.activeConversationId).toBe("conv-1");
    });
  });

  describe("streaming integration", () => {
    it("forwards streamContent and isStreaming from useAiMessageStream", () => {
      mockUseAiMessageStream.mockReturnValue({
        streamContent: "Hello World",
        isStreaming: true,
        startStream: mockStartStream,
        stopStream: mockStopStream,
        resetStream: mockResetStream,
      });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      expect(result.current.streamContent).toBe("Hello World");
      expect(result.current.isStreaming).toBe(true);
    });

    it("stopStreaming delegates to resetStream", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.stopStreaming();
      });

      expect(mockResetStream).toHaveBeenCalledOnce();
    });

    it("wires onComplete callback to append cache, refetch messages, and clear pending", () => {
      const refetchMessages = vi.fn().mockResolvedValue(undefined);
      mockMessagesQuery.mockReturnValue({ data: null, loading: false, refetch: refetchMessages });

      renderHook(() => useChatPanelViewModel("job-1"));

      const calls = mockUseAiMessageStream.mock.calls as unknown as Array<
        [
          {
            onComplete?: (p: {
              input: unknown;
              userMessageId?: string | null;
              aiMessageId?: string | null;
              streamContent: string;
            }) => void;
            onReady?: (input: unknown) => Promise<void>;
          },
        ]
      >;
      const streamOptions = calls[0]?.[0];
      expect(streamOptions?.onComplete).toBeTypeOf("function");

      act(() => {
        streamOptions?.onComplete?.({
          input: { conversationId: "conv-1", content: "Hello" },
          userMessageId: "msg-user",
          aiMessageId: "msg-ai",
          streamContent: "Hi there",
        });
      });

      expect(mockAppendAiMessagesToCache).toHaveBeenCalledWith(
        mockApolloCache,
        "conv-1",
        expect.arrayContaining([
          expect.objectContaining({ id: "msg-user", role: "User", content: "Hello" }),
          expect.objectContaining({ id: "msg-ai", role: "Assistant", content: "Hi there" }),
        ]),
      );
      expect(refetchMessages).toHaveBeenCalled();
    });
  });

  describe("loading", () => {
    it("true when conversations are loading", () => {
      mockConversationsQuery.mockReturnValue({ data: null, loading: true });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));
      expect(result.current.loading).toBe(true);
    });

    it("true when messages are loading with active conversation", () => {
      mockMessagesQuery.mockReturnValue({ data: null, loading: true, refetch: vi.fn() });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      expect(result.current.loading).toBe(true);
    });

    it("false when no active conversation and conversations loaded", () => {
      mockConversationsQuery.mockReturnValue({ data: { aiConversations: [] }, loading: false });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      expect(result.current.loading).toBe(false);
    });
  });

  it("messages are sorted by createdAt asc from API", () => {
    mockMessagesQuery.mockReturnValue({
      data: {
        aiMessages: [
          {
            __typename: "AiMessageType",
            id: "msg-1",
            conversationId: "conv-1",
            role: "User",
            content: "Hello",
            createdAt: "2024-01-02T00:00:00Z",
          },
          {
            __typename: "AiMessageType",
            id: "msg-2",
            conversationId: "conv-1",
            role: "Assistant",
            content: "Hi there",
            createdAt: "2024-01-02T00:01:00Z",
          },
        ],
      },
      loading: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));

    act(() => {
      result.current.switchConversation("conv-1");
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].id).toBe("msg-1");
    expect(result.current.messages[1].id).toBe("msg-2");
  });

  describe("isSending", () => {
    it("reflects isCreating", () => {
      mockCreateConversationMut.mockReturnValue([vi.fn(), { loading: true }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));
      expect(result.current.isCreating).toBe(true);
      expect(result.current.isSending).toBe(true);
    });

    it("reflects isStreaming", () => {
      mockUseAiMessageStream.mockReturnValue({
        streamContent: "Hello",
        isStreaming: true,
        startStream: mockStartStream,
        stopStream: mockStopStream,
        resetStream: mockResetStream,
      });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      expect(result.current.isStreaming).toBe(true);
      expect(result.current.isSending).toBe(true);
    });

    it("false when neither creating nor streaming", () => {
      const { result } = renderHook(() => useChatPanelViewModel("job-1"));
      expect(result.current.isSending).toBe(false);
    });
  });

  it("isCreating reflects mutation loading state", () => {
    mockCreateConversationMut.mockReturnValue([vi.fn(), { loading: true }]);

    const { result } = renderHook(() => useChatPanelViewModel("job-1"));
    expect(result.current.isCreating).toBe(true);
  });

  describe("pendingMessages", () => {
    it("pending message appears immediately after send and stays until completed", async () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      expect(result.current.messages).toHaveLength(0);

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].role).toBe("User");
      expect(result.current.messages[0].content).toBe("Hello");
      expect(result.current.messages[0].id).toMatch(/^pending-/);
    });

    it("onComplete callback clears pending messages after writing cache", () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      act(() => {
        void result.current.sendMessage("Hello");
      });

      const calls2 = mockUseAiMessageStream.mock.calls as unknown as Array<
        [
          {
            onComplete?: (p: {
              input: unknown;
              userMessageId?: string | null;
              aiMessageId?: string | null;
              streamContent: string;
            }) => void;
          },
        ]
      >;
      const streamOptions2 = calls2[0]?.[0];

      act(() => {
        streamOptions2?.onComplete?.({
          input: { conversationId: "conv-1", content: "Hello" },
          userMessageId: "msg-user",
          aiMessageId: "msg-ai",
          streamContent: "Hi there",
        });
      });

      expect(mockAppendAiMessagesToCache).toHaveBeenCalled();
      expect(result.current.messages).toHaveLength(0);
    });

    it("mutation failure removes specific pending message (rollback)", async () => {
      mockTryRun.mockResolvedValue([new Error("ask failed"), null]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(1);

      const calls3 = mockUseAiMessageStream.mock.calls as unknown as Array<
        [{ onReady?: (input: { conversationId: string; content: string }) => Promise<void> }]
      >;
      const onReady = calls3.at(-1)?.[0]?.onReady;

      await act(async () => {
        await expect(onReady?.({ conversationId: "conv-1", content: "Hello" })).rejects.toThrow("ask failed");
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it("switch conversation clears all pending", async () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.switchConversation(null);
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it("rollback removes only the specific failed pending, not previous ones", async () => {
      mockTryRun.mockResolvedValue([null, { data: { askAiQuestion: { success: true } } }]);

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("Hello");

      await act(async () => {
        await result.current.sendMessage("World");
      });

      expect(result.current.messages).toHaveLength(2);

      const calls4 = mockUseAiMessageStream.mock.calls as unknown as Array<
        [{ onReady?: (input: { conversationId: string; content: string }) => Promise<void> }]
      >;
      const secondOnReady = calls4.at(-1)?.[0]?.onReady;
      mockTryRun.mockResolvedValueOnce([new Error("ask failed"), null]);

      await act(async () => {
        await expect(secondOnReady?.({ conversationId: "conv-1", content: "World" })).rejects.toThrow("ask failed");
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("Hello");
    });

    it("deleteConversation clears pending", async () => {
      const mutateFn = vi.fn().mockImplementation((options: { update?: (c: unknown, r: unknown) => void }) => {
        const mutationResult = { data: { deleteAiConversation: { success: true, deletedId: "conv-1" } } };
        return Promise.resolve(mutationResult).then((result) => {
          options.update?.({} as unknown, mutationResult);
          return result;
        });
      });
      mockDeleteConversationMut.mockReturnValue([mutateFn, { loading: false }]);
      mockTryRun.mockImplementation(async (promise: Promise<unknown>) => {
        try {
          const result = await promise;
          return [null, result];
        } catch (e) {
          return [e instanceof Error ? e : new Error(String(e)), null];
        }
      });

      const { result } = renderHook(() => useChatPanelViewModel("job-1"));

      act(() => {
        result.current.switchConversation("conv-1");
      });

      await act(async () => {
        await result.current.sendMessage("Hello");
      });

      expect(result.current.messages).toHaveLength(1);

      await act(async () => {
        await result.current.deleteConversation("conv-1");
      });

      expect(result.current.messages).toHaveLength(0);
      expect(result.current.activeConversationId).toBeNull();
    });
  });
});
