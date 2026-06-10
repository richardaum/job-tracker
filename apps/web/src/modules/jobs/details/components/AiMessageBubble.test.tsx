import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiMessageRole } from "@/gql/hooks";

import { AiMessageBubble } from "./AiMessageBubble";

describe("AiMessageBubble", () => {
  it("renders user message right-aligned", () => {
    render(<AiMessageBubble content="Hello" role={AiMessageRole.User} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByTestId("message-bubble-user")).toBeInTheDocument();
  });

  it("renders assistant message left-aligned with icon", () => {
    render(<AiMessageBubble content="Hi there" role={AiMessageRole.Assistant} />);
    expect(screen.getByText("Hi there")).toBeInTheDocument();
    expect(screen.getByTestId("message-bubble-assistant")).toBeInTheDocument();
  });

  it("shows streaming cursor when isStreaming", () => {
    render(<AiMessageBubble content="Thinking..." role={AiMessageRole.Assistant} isStreaming />);
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
    expect(screen.getByTestId("message-bubble-assistant")).toBeInTheDocument();
  });

  it("shows error state with retry button", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<AiMessageBubble content="irrelevant" role={AiMessageRole.Assistant} hasError onRetry={onRetry} />);

    expect(screen.getByText("Failed to generate")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();

    await user.click(screen.getByText("Retry"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not show error state for user messages", () => {
    render(<AiMessageBubble content="test" role={AiMessageRole.User} hasError onRetry={vi.fn()} />);
    expect(screen.queryByText("Failed to generate")).not.toBeInTheDocument();
  });
});
