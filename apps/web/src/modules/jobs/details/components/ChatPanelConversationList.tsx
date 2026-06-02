"use client";

import { Button, cn, ConfirmDialog, IconButton, Text, TruncateText } from "@job-tracker/ui";
import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

export type Conversation = { id: string; title: string; createdAt: string };

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationChange: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onCreateConversation: () => void;
  isCreatingConversation?: boolean;
  isNarrow?: boolean;
};

export function ChatPanelConversationList({
  conversations,
  activeConversationId,
  onConversationChange,
  onDeleteConversation,
  onCreateConversation,
  isCreatingConversation = false,
  isNarrow = false,
}: ConversationListProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    onDeleteConversation(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <>
      <div className={cn("flex min-h-0 flex-1 flex-col", !isNarrow && "w-48 border-r border-border-subtle")}>
        {!isNarrow ? (
          <div className={cn("shrink-0 border-b border-border-subtle p-2")}>
            <Button
              size="sm"
              intent="ghost"
              onClick={onCreateConversation}
              state={isCreatingConversation ? "loading" : "default"}
            >
              <PlusIcon size={14} weight="bold" />
              New chat
            </Button>
          </div>
        ) : null}
        <div className={cn("flex-1 overflow-y-auto")}>
          {conversations.length === 0 ? (
            <div className={cn("px-3 py-4 text-center")}>
              <Text size="sm" color="muted">
                No conversations
              </Text>
            </div>
          ) : (
            <div className={cn("flex flex-col")}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-1 px-3 py-2 text-sm transition-colors hover:has-[[data-del-btn]:hover]:bg-transparent hover:bg-bg-surface-hover",
                    conv.id === activeConversationId
                      ? "bg-bg-surface-hover font-medium text-text-primary"
                      : "text-text-muted",
                  )}
                  onClick={() => onConversationChange(conv.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onConversationChange(conv.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-current={conv.id === activeConversationId ? "true" : undefined}
                >
                  <TruncateText className={cn("flex-1")}>{conv.title}</TruncateText>
                  <IconButton
                    data-del-btn
                    size="xs"
                    intent="ghost"
                    label="Delete conversation"
                    tooltip="Delete conversation"
                    icon={<TrashIcon size={13} weight="regular" />}
                    className={cn("opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(conv.id);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        confirmIntent="destructive"
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      />
    </>
  );
}
