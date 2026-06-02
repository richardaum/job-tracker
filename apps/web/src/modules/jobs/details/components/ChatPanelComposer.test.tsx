import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatPanelComposer } from "./ChatPanelComposer";

describe("ChatPanelComposer", () => {
  it("calls onSend with content on Enter", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatPanelComposer onSend={onSend} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello, AI!");

    const sendButton = screen.getByRole("button", { name: "Send" });
    await user.click(sendButton);

    expect(onSend).toHaveBeenCalledWith("Hello, AI!");
  });

  it("does not call onSend with empty content", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatPanelComposer onSend={onSend} />);

    const sendButton = screen.getByRole("button", { name: "Send" });
    await user.click(sendButton);

    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears textarea after sending", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatPanelComposer onSend={onSend} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello!");
    await user.click(screen.getByRole("button", { name: "Send" }));

    expect(textarea).toHaveValue("");
  });

  it("sends on Enter key", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatPanelComposer onSend={onSend} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test message{Enter}");

    expect(onSend).toHaveBeenCalledWith("Test message");
  });

  it("does not send on Shift+Enter", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();

    render(<ChatPanelComposer onSend={onSend} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test{Shift>}{Enter}{/Shift}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables send button when disabled prop is true", () => {
    render(<ChatPanelComposer onSend={vi.fn()} disabled={true} />);

    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("renders with placeholder text", () => {
    render(<ChatPanelComposer onSend={vi.fn()} />);

    expect(screen.getByPlaceholderText("Ask anything about this job...")).toBeInTheDocument();
  });
});
