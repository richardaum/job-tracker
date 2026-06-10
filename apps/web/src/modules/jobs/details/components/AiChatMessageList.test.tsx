import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiMessageRole } from "@/gql/hooks";
import { AiChatMessageList } from "./AiChatMessageList";

const MOCK_MESSAGES = [
  { id: "1", role: AiMessageRole.User, content: "Hello", createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", role: AiMessageRole.Assistant, content: "Hi there", createdAt: "2024-01-01T00:00:10Z" },
];

describe("AiChatMessageList", () => {
  it("renders all messages", () => {
    render(<AiChatMessageList conversationId="conv-1" messages={MOCK_MESSAGES} isStreaming={false} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });

  it("renders empty messages state without crashing", () => {
    render(<AiChatMessageList conversationId="conv-1" messages={[]} isStreaming={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
