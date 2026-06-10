import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiChatComposer } from "./AiChatComposer";

describe("AiChatComposer", () => {
  it("renders input and send button", () => {
    render(<AiChatComposer onSend={vi.fn()} disabled={false} isStreaming={false} />);
    expect(screen.getByPlaceholderText("Ask a question...")).toBeInTheDocument();
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<AiChatComposer onSend={vi.fn()} disabled={false} isStreaming={false} />);
    expect(screen.getByText("Send")).toBeDisabled();
  });

  it("send button is disabled when disabled prop is true", async () => {
    const user = userEvent.setup();
    render(<AiChatComposer onSend={vi.fn()} disabled={true} isStreaming={false} />);

    const input = screen.getByPlaceholderText("Ask a question...");
    await user.type(input, "Hello");
    expect(screen.getByText("Send")).toBeDisabled();
  });

  it("calls onSend with trimmed content and clears input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(<AiChatComposer onSend={onSend} disabled={false} isStreaming={false} />);

    const input = screen.getByPlaceholderText("Ask a question...");
    await user.type(input, "Hello world");
    await user.click(screen.getByText("Send"));

    expect(onSend).toHaveBeenCalledWith("Hello world");
    expect(input).toHaveValue("");
  });

  it("sends on Enter key", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();

    render(<AiChatComposer onSend={onSend} disabled={false} isStreaming={false} />);

    const input = screen.getByPlaceholderText("Ask a question...");
    await user.type(input, "Hello{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("shows loading state when streaming", () => {
    render(<AiChatComposer onSend={vi.fn()} disabled={false} isStreaming={true} />);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
