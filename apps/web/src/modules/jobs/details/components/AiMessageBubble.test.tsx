import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiMessageBubble } from "./AiMessageBubble";

describe("AiMessageBubble", () => {
  it("renders finalized message with AI badge", () => {
    render(<AiMessageBubble variant="finalized" content="This is an AI response" />);

    expect(screen.getByText("This is an AI response")).toBeInTheDocument();
  });

  it("renders streaming state with pulsing cursor", () => {
    render(<AiMessageBubble variant="streaming" content="Partial response" />);

    expect(screen.getByText("Partial response")).toBeInTheDocument();
    expect(screen.getByTestId("streaming-cursor")).toBeInTheDocument();
  });

  it("renders error state with retry link", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<AiMessageBubble variant="error" content="Failed to generate response" onRetry={onRetry} />);

    expect(screen.getByText("Failed to generate response")).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: "Retry" });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders error state with default message when no content provided", () => {
    render(<AiMessageBubble variant="error" content="" />);

    expect(screen.getByText("Failed to generate response")).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<AiMessageBubble variant="error" content="Error" />);

    expect(screen.queryByRole("button", { name: "Retry" })).not.toBeInTheDocument();
  });
});
