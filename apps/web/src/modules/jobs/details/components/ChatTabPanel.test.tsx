import { Tabs } from "@job-tracker/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { UseChatPanelViewModelReturn } from "@/modules/jobs/details/hooks/useChatPanelViewModel";

import { ChatTabPanel } from "./ChatTabPanel";

const mockViewModel = vi.hoisted(() => ({
  useChatPanelViewModel: vi.fn<(jobId: string) => UseChatPanelViewModelReturn>(),
}));

vi.mock("@/modules/jobs/details/hooks/useChatPanelViewModel", () => ({
  useChatPanelViewModel: mockViewModel.useChatPanelViewModel,
}));

function buildMockViewModel(overrides?: Partial<UseChatPanelViewModelReturn>): UseChatPanelViewModelReturn {
  return {
    conversations: overrides?.conversations ?? [],
    conversationsLoading: false,
    activeConversationId: overrides?.activeConversationId,
    messages: overrides?.messages ?? [],
    isStreaming: false,
    streamingContent: "",
    isCreatingConversation: false,
    error: undefined,
    createConversation: vi.fn(),
    createAndSendFirstMessage: vi.fn(),
    deleteConversation: vi.fn(),
    askQuestion: vi.fn(),
    switchConversation: vi.fn(),
    ...overrides,
  };
}

describe("ChatTabPanel", () => {
  function renderWithTabs() {
    return render(
      <Tabs value="chat" onValueChange={() => {}}>
        <ChatTabPanel jobId="job-42" />
      </Tabs>,
    );
  }

  it("renders empty state prompting to start a conversation", () => {
    mockViewModel.useChatPanelViewModel.mockReturnValue(buildMockViewModel());

    renderWithTabs();

    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start new conversation" })).toBeInTheDocument();
  });

  it("calls createAndSendFirstMessage when user sends the first message", async () => {
    const createAndSendFirstMessage = vi.fn().mockResolvedValue("conv-1");
    mockViewModel.useChatPanelViewModel.mockReturnValue(buildMockViewModel({ createAndSendFirstMessage }));

    const user = userEvent.setup();
    renderWithTabs();

    await user.click(screen.getByRole("button", { name: "Start new conversation" }));

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello, AI!{Enter}");

    expect(createAndSendFirstMessage).toHaveBeenCalledWith("Hello, AI!");
  });

  it("shows conversation list when conversations exist", () => {
    mockViewModel.useChatPanelViewModel.mockReturnValue(
      buildMockViewModel({
        conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2025-01-01T00:00:00Z" }],
        activeConversationId: "conv-1",
      }),
    );

    renderWithTabs();

    expect(screen.getByText("Chat 1")).toBeInTheDocument();
    expect(screen.getByText("New chat")).toBeInTheDocument();
  });

  it("calls askQuestion when user sends a message", async () => {
    const askQuestion = vi.fn().mockResolvedValue(undefined);
    mockViewModel.useChatPanelViewModel.mockReturnValue(
      buildMockViewModel({
        conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2025-01-01T00:00:00Z" }],
        activeConversationId: "conv-1",
        askQuestion,
      }),
    );

    const user = userEvent.setup();
    renderWithTabs();

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello, AI!{Enter}");

    expect(askQuestion).toHaveBeenCalledWith("Hello, AI!");
  });

  it("calls deleteConversation when delete is confirmed", async () => {
    const deleteConversation = vi.fn().mockResolvedValue(undefined);
    mockViewModel.useChatPanelViewModel.mockReturnValue(
      buildMockViewModel({
        conversations: [{ id: "conv-1", title: "Chat 1", createdAt: "2025-01-01T00:00:00Z" }],
        activeConversationId: "conv-1",
        deleteConversation,
      }),
    );

    const user = userEvent.setup();
    renderWithTabs();

    const deleteButtons = screen.getAllByLabelText("Delete conversation");
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    await user.click(confirmButton);

    expect(deleteConversation).toHaveBeenCalledWith("conv-1");
  });
});
