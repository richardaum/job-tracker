import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AiChatConversationListView } from "./AiChatConversationListView";

const MOCK_CONVERSATIONS = [
  { id: "conv-1", title: "First chat", createdAt: "2024-01-01T00:00:00Z" },
  { id: "conv-2", title: "Second chat", createdAt: "2024-01-02T00:00:00Z" },
];

describe("AiChatConversationListView", () => {
  it("shows skeleton when loading with no conversations", () => {
    render(
      <AiChatConversationListView
        conversations={[]}
        loading={true}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
      />,
    );
    expect(screen.getByText("Conversations")).toBeInTheDocument();
  });

  it("shows empty state when no conversations and not loading", () => {
    render(
      <AiChatConversationListView
        conversations={[]}
        loading={false}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
      />,
    );
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("renders conversation list", () => {
    render(
      <AiChatConversationListView
        conversations={MOCK_CONVERSATIONS}
        loading={false}
        onSelectConversation={vi.fn()}
        onDeleteConversation={vi.fn()}
      />,
    );
    expect(screen.getByText("First chat")).toBeInTheDocument();
    expect(screen.getByText("Second chat")).toBeInTheDocument();
  });

  it("calls onSelectConversation when clicking a conversation", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <AiChatConversationListView
        conversations={MOCK_CONVERSATIONS}
        loading={false}
        onSelectConversation={onSelect}
        onDeleteConversation={vi.fn()}
      />,
    );

    await user.click(screen.getByText("First chat"));
    expect(onSelect).toHaveBeenCalledWith("conv-1");
  });

  it("calls onDeleteConversation when clicking delete", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <AiChatConversationListView
        conversations={MOCK_CONVERSATIONS}
        loading={false}
        onSelectConversation={vi.fn()}
        onDeleteConversation={onDelete}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete conversation");
    await user.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith("conv-1");
  });
});
