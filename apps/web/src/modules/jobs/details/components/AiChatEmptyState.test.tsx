import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AiChatEmptyState } from "./AiChatEmptyState";

describe("AiChatEmptyState", () => {
  it("renders no-conversations variant", () => {
    render(<AiChatEmptyState variant="no-conversations" />);
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("renders no-messages variant", () => {
    render(<AiChatEmptyState variant="no-messages" />);
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
  });

  it("renders select-conversation variant", () => {
    render(<AiChatEmptyState variant="select-conversation" />);
    expect(screen.getByText(/select or start a conversation/i)).toBeInTheDocument();
  });

  it("renders new-conversation variant", () => {
    render(<AiChatEmptyState variant="new-conversation" />);
    expect(screen.getByText(/type your first message to begin/i)).toBeInTheDocument();
  });

  it("applies className", () => {
    render(<AiChatEmptyState variant="no-conversations" className="extra-class" />);
    expect(screen.getByTestId("ai-chat-empty-state")).toHaveClass("extra-class");
  });
});
