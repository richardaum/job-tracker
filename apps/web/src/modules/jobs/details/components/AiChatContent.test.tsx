import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotsProvider } from "@job-tracker/react-slots";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/jobs/job-1/chat",
  useRouter: () => ({ replace: vi.fn() }),
}));

const mockViewModel = vi.hoisted(() => vi.fn());

vi.mock("@/modules/jobs/details/hooks/useChatPanelViewModel", () => ({ useChatPanelViewModel: mockViewModel }));

import { AiChatContent } from "./AiChatContent";
import { JobHeaderActions } from "@/modules/jobs/details/job-details-header.slots";

function renderWithSlots(ui: ReactElement) {
  return render(
    <SlotsProvider>
      <div>
        <JobHeaderActions.Slot />
      </div>
      {ui}
    </SlotsProvider>,
  );
}

function createDefaultVm(overrides: Record<string, unknown> = {}) {
  const defaults: Record<string, unknown> = {
    conversations: [],
    activeConversationId: null,
    isNewConversation: false,
    messages: [],
    loading: false,
    conversationsLoading: false,
    isCreating: false,
    isStreaming: false,
    isSending: false,
    streamContent: "",
    startNewConversation: vi.fn(),
    deleteConversation: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    switchConversation: vi.fn(),
  };
  return { ...defaults, ...overrides } as ReturnType<typeof mockViewModel>;
}

describe("AiChatContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fullWidth=false (default)", () => {
    it("renders conversation list when no active conversation", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [
            { id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" },
            { id: "conv-2", title: "Chat 2", createdAt: "2024-01-02T00:00:00Z" },
          ],
        }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" />);
      expect(screen.getByText("Chat 1")).toBeInTheDocument();
      expect(screen.getByText("Chat 2")).toBeInTheDocument();
    });

    it("renders chat view when active conversation exists", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
        }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Chat 1")).toBeInTheDocument();
    });

    it("calls switchConversation(null) when back is clicked", async () => {
      const switchConversation = vi.fn();
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
          switchConversation,
        }),
      );

      const user = userEvent.setup();
      renderWithSlots(<AiChatContent jobId="job-1" />);

      await user.click(screen.getByText("Back"));
      expect(switchConversation).toHaveBeenCalledWith(null);
    });

    it("calls sendMessage when sending a message", async () => {
      const sendMessage = vi.fn().mockResolvedValue(undefined);
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
          sendMessage,
        }),
      );

      const user = userEvent.setup();
      renderWithSlots(<AiChatContent jobId="job-1" />);

      const input = screen.getByPlaceholderText("Ask a question...");
      await user.type(input, "Hi{Enter}");

      expect(sendMessage).toHaveBeenCalledWith("Hi");
    });

    it("shows loading state", () => {
      mockViewModel.mockReturnValue(createDefaultVm({ conversations: [], activeConversationId: null, loading: true }));

      renderWithSlots(<AiChatContent jobId="job-1" />);
      expect(screen.getByText("Conversations")).toBeInTheDocument();
    });

    it("applies className", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({ conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }] }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" className="extra-class" />);
      expect(screen.getByTestId("ai-chat-content")).toHaveClass("extra-class");
    });

    it("calls startNewConversation instead of createConversation", async () => {
      const startNewConversation = vi.fn();
      mockViewModel.mockReturnValue(
        createDefaultVm({ conversations: [], activeConversationId: null, startNewConversation }),
      );

      const user = userEvent.setup();
      renderWithSlots(<AiChatContent jobId="job-1" />);

      await user.click(screen.getByText("New Chat"));
      expect(startNewConversation).toHaveBeenCalledTimes(1);
    });
  });

  describe("fullWidth=true", () => {
    it("shows conversation list on the left", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({ conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }] }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.getByText("Chat 1")).toBeInTheDocument();
    });

    it("shows select-conversation empty state when nothing active", () => {
      mockViewModel.mockReturnValue(createDefaultVm());

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.getByText(/select or start a conversation/i)).toBeInTheDocument();
    });

    it("shows chat view when active conversation exists", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
        }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getAllByText("Chat 1")).toHaveLength(2);
    });

    it("shows new-conversation state when isNewConversation", () => {
      mockViewModel.mockReturnValue(createDefaultVm({ isNewConversation: true }));

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.getByText(/type your first message/i)).toBeInTheDocument();
    });

    it("list and chat both visible in split layout", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
        }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.getAllByText("Chat 1")).toHaveLength(2);
      expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("does not show Back button in chat view", () => {
      mockViewModel.mockReturnValue(
        createDefaultVm({
          conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2024-01-01T00:00:00Z" }],
          activeConversationId: "conv-1",
          messages: [{ id: "msg-1", role: "User", content: "Hello", createdAt: "2024-01-01T00:00:00Z" }],
        }),
      );

      renderWithSlots(<AiChatContent jobId="job-1" fullWidth={true} />);
      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });
  });
});
