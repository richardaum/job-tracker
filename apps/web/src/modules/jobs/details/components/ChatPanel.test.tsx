import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatPanel } from "./ChatPanel";
import type { Conversation } from "./ChatPanelConversationList";
import type { ChatMessage } from "./ChatPanelMessageList";

const conversations: Conversation[] = [
  { id: "1", title: "Company research", createdAt: "2026-06-01T10:00:00Z" },
  { id: "2", title: "Fit analysis", createdAt: "2026-06-01T11:00:00Z" },
];

const messages: ChatMessage[] = [
  { id: "m1", role: "user", content: "What does this company do?", createdAt: "2026-06-01T10:00:00Z" },
  { id: "m2", role: "assistant", content: "They make AI software.", createdAt: "2026-06-01T10:01:00Z" },
];

describe("ChatPanel", () => {
  it("shows empty state when no conversations exist", () => {
    render(
      <ChatPanel
        conversations={[]}
        messages={[]}
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start new conversation" })).toBeInTheDocument();
  });

  it("renders conversation list with titles when conversations exist", () => {
    render(
      <ChatPanel
        conversations={conversations}
        messages={[]}
        activeConversationId="1"
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("Company research")).toBeInTheDocument();
    expect(screen.getByText("Fit analysis")).toBeInTheDocument();
  });

  it("renders messages for active conversation", () => {
    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("What does this company do?")).toBeInTheDocument();
    expect(screen.getByText("They make AI software.")).toBeInTheDocument();
  });

  it("switching conversations updates message list", async () => {
    const user = userEvent.setup();
    const onConversationChange = vi.fn();

    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        onConversationChange={onConversationChange}
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Fit analysis"));

    expect(onConversationChange).toHaveBeenCalledWith("2");
  });

  it("shows streaming indicator when isStreaming is true", () => {
    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        isStreaming={true}
        streamingContent="Partial response..."
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("Partial response...")).toBeInTheDocument();
  });

  it("sends message via composer", async () => {
    const user = userEvent.setup();
    const onSendMessage = vi.fn();

    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={onSendMessage}
      />,
    );

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "New question{Enter}");

    expect(onSendMessage).toHaveBeenCalledWith("New question");
  });

  it("renders New chat button in sidebar", () => {
    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("New chat")).toBeInTheDocument();
  });

  it("renders composer at bottom", () => {
    render(
      <ChatPanel
        conversations={conversations}
        messages={messages}
        activeConversationId="1"
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("shows error state with retry when onRetry provided", () => {
    const errorMessages: ChatMessage[] = [
      { id: "e1", role: "user", content: "Question", createdAt: "2026-06-01T10:00:00Z" },
      { id: "e2", role: "assistant", content: "Failed to generate response", createdAt: "2026-06-01T10:01:00Z" },
    ];

    render(
      <ChatPanel
        conversations={conversations}
        messages={errorMessages}
        activeConversationId="1"
        onRetry={vi.fn()}
        onCreateConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
        onSendMessage={vi.fn()}
      />,
    );

    expect(screen.getByText("Failed to generate response")).toBeInTheDocument();
  });
});
