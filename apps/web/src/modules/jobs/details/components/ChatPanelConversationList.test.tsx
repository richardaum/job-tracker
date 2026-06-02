import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChatPanelConversationList, type Conversation } from "./ChatPanelConversationList";

const conversations: Conversation[] = [
  { id: "1", title: "Company research", createdAt: "2026-06-01T10:00:00Z" },
  { id: "2", title: "Fit analysis", createdAt: "2026-06-01T11:00:00Z" },
  { id: "3", title: "Interview prep", createdAt: "2026-06-01T12:00:00Z" },
];

describe("ChatPanelConversationList", () => {
  it("renders conversation titles", () => {
    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    expect(screen.getByText("Company research")).toBeInTheDocument();
    expect(screen.getByText("Fit analysis")).toBeInTheDocument();
    expect(screen.getByText("Interview prep")).toBeInTheDocument();
  });

  it("highlights active conversation", () => {
    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="2"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    const items = screen.getAllByRole("button");
    const activeItem = items.find((item) => item.getAttribute("aria-current") === "true");
    expect(activeItem).toBeInTheDocument();
    expect(activeItem).toHaveTextContent("Fit analysis");
  });

  it("calls onConversationChange when a conversation is clicked", async () => {
    const user = userEvent.setup();
    const onConversationChange = vi.fn();

    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={onConversationChange}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Fit analysis"));

    expect(onConversationChange).toHaveBeenCalledWith("2");
  });

  it("renders New chat button", () => {
    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    expect(screen.getByText("New chat")).toBeInTheDocument();
  });

  it("calls onCreateConversation when New chat is clicked", async () => {
    const user = userEvent.setup();
    const onCreateConversation = vi.fn();

    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={onCreateConversation}
      />,
    );

    await user.click(screen.getByText("New chat"));

    expect(onCreateConversation).toHaveBeenCalledTimes(1);
  });

  it("shows delete buttons per conversation", () => {
    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete conversation");
    expect(deleteButtons).toHaveLength(3);
  });

  it("shows confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete conversation");
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/Are you sure you want to delete this conversation/)).toBeInTheDocument();
  });

  it("calls onDeleteConversation after confirmation", async () => {
    const user = userEvent.setup();
    const onDeleteConversation = vi.fn();

    render(
      <ChatPanelConversationList
        conversations={conversations}
        activeConversationId="1"
        onConversationChange={vi.fn()}
        onDeleteConversation={onDeleteConversation}
        onCreateConversation={vi.fn()}
      />,
    );

    const deleteButtons = screen.getAllByLabelText("Delete conversation");
    await user.click(deleteButtons[0]);

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    await user.click(confirmButton);

    expect(onDeleteConversation).toHaveBeenCalledWith("1");
  });

  it("renders no conversations message when empty", () => {
    render(
      <ChatPanelConversationList
        conversations={[]}
        activeConversationId={undefined}
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    expect(screen.getByText("No conversations")).toBeInTheDocument();
  });

  it("shows New chat button even when empty", () => {
    render(
      <ChatPanelConversationList
        conversations={[]}
        activeConversationId={undefined}
        onConversationChange={vi.fn()}
        onDeleteConversation={vi.fn()}
        onCreateConversation={vi.fn()}
      />,
    );

    expect(screen.getByText("New chat")).toBeInTheDocument();
  });
});
