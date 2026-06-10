import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiMessageRole } from "@/gql/hooks";
import { AiChatChatView } from "./AiChatChatView";

const MOCK_MESSAGES = [{ id: "1", role: AiMessageRole.User, content: "Hello", createdAt: "2024-01-01T00:00:00Z" }];

function ChatViewWrapper(props: Partial<Parameters<typeof AiChatChatView>[0]>) {
  return (
    <AiChatChatView
      messages={props.messages ?? []}
      loading={props.loading ?? false}
      conversationTitle={props.conversationTitle ?? "Test Chat"}
      onBack={props.onBack ?? vi.fn()}
      isStreaming={props.isStreaming ?? false}
      isNewConversation={props.isNewConversation}
      onSend={props.onSend ?? vi.fn()}
      disabled={props.disabled ?? false}
      conversationId={props.conversationId ?? null}
    />
  );
}

describe("AiChatChatView", () => {
  it("shows skeleton when loading with no messages", () => {
    render(<ChatViewWrapper loading={true} messages={[]} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
    expect(screen.queryByText(/no messages yet/i)).not.toBeInTheDocument();
  });

  it("shows empty state when no messages and not loading", () => {
    render(<ChatViewWrapper messages={[]} />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it("shows message list when messages exist", () => {
    render(<ChatViewWrapper messages={MOCK_MESSAGES} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("shows stream content when streaming", () => {
    render(<ChatViewWrapper messages={MOCK_MESSAGES} isStreaming={true} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("calls onBack when back button clicked", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(<ChatViewWrapper onBack={onBack} messages={MOCK_MESSAGES} />);
    await user.click(screen.getByText("Back"));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders conversation title", () => {
    render(<ChatViewWrapper conversationTitle="My Chat" messages={MOCK_MESSAGES} />);
    expect(screen.getByText("My Chat")).toBeInTheDocument();
  });

  it("shows New conversation title when isNewConversation", () => {
    render(<ChatViewWrapper isNewConversation={true} messages={[]} />);
    expect(screen.getByText("New conversation")).toBeInTheDocument();
  });

  it("shows empty state when isNewConversation", () => {
    render(<ChatViewWrapper isNewConversation={true} messages={[]} />);
    expect(screen.getByText(/type your first message/i)).toBeInTheDocument();
  });

  it("does not render Back button when onBack is undefined", () => {
    function NoBackWrapper() {
      return (
        <AiChatChatView
          messages={MOCK_MESSAGES}
          loading={false}
          conversationTitle="Test"
          isStreaming={false}
          onSend={vi.fn()}
          disabled={false}
          conversationId={null}
        />
      );
    }
    render(<NoBackWrapper />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("enables composer when isNewConversation even if disabled prop is true", () => {
    render(<ChatViewWrapper isNewConversation={true} messages={[]} disabled={true} />);
    expect(screen.getByPlaceholderText("Ask a question...")).not.toBeDisabled();
  });
});
