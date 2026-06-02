import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatPanelEmptyState } from "./ChatPanelEmptyState";

describe("ChatPanelEmptyState", () => {
  it("renders icon + message + button", () => {
    render(<ChatPanelEmptyState onCreateConversation={vi.fn()} />);

    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(screen.getByText("Start a new conversation to ask questions about this job.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start new conversation" })).toBeInTheDocument();
  });

  it("calls onCreateConversation when button is clicked", async () => {
    const user = userEvent.setup();
    const onCreateConversation = vi.fn();

    render(<ChatPanelEmptyState onCreateConversation={onCreateConversation} />);

    await user.click(screen.getByRole("button", { name: "Start new conversation" }));

    expect(onCreateConversation).toHaveBeenCalledTimes(1);
  });
});
