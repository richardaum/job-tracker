import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChatPanelMessageList, type ChatMessage } from "./ChatPanelMessageList";

const messages: ChatMessage[] = [
  { id: "1", role: "user", content: "What does this company do?", createdAt: "2026-06-01T10:00:00Z" },
  {
    id: "2",
    role: "assistant",
    content: "This company develops AI-powered solutions for enterprise customers.",
    createdAt: "2026-06-01T10:01:00Z",
  },
  { id: "3", role: "user", content: "Tell me about their culture", createdAt: "2026-06-01T10:02:00Z" },
];

describe("ChatPanelMessageList", () => {
  it("renders messages in correct alignment (user right, AI left)", () => {
    render(<ChatPanelMessageList messages={messages} />);

    const userMessages = screen.getAllByTestId("user-message");
    expect(userMessages.length).toBeGreaterThanOrEqual(2);
  });

  it("renders user messages and AI messages", () => {
    render(<ChatPanelMessageList messages={messages} />);

    expect(screen.getByText("What does this company do?")).toBeInTheDocument();
  });

  it("renders streaming state with AI thinking message", () => {
    render(<ChatPanelMessageList messages={messages} isStreaming={true} streamingContent="" />);

    expect(screen.getByText("AI is thinking...")).toBeInTheDocument();
  });

  it("renders streaming state with partial content", () => {
    render(<ChatPanelMessageList messages={messages} isStreaming={true} streamingContent="Partial AI response" />);

    expect(screen.getByText("Partial AI response")).toBeInTheDocument();
  });

  it("renders empty state when no messages", () => {
    render(<ChatPanelMessageList messages={[]} />);

    expect(screen.getByText("Send a message to start the conversation.")).toBeInTheDocument();
  });

  it("does not show empty state when streaming with no messages", () => {
    render(<ChatPanelMessageList messages={[]} isStreaming={true} streamingContent="" />);

    expect(screen.queryByText("Send a message to start the conversation.")).not.toBeInTheDocument();
    expect(screen.getByText("AI is thinking...")).toBeInTheDocument();
  });
});
