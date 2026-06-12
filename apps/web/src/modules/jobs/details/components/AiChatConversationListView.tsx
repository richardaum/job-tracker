"use client";

import { cn, IconButton, Skeleton, Stack, Text } from "@job-tracker/ui";
import { TrashIcon } from "@phosphor-icons/react";

import { AiChatEmptyState } from "./AiChatEmptyState";

type ConversationItem = { id: string; title: string; createdAt: string };

type AiChatConversationListViewProps = {
  conversations: ConversationItem[];
  loading: boolean;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
};

/** Scrollable sidebar of conversations with select and delete actions. */
export function AiChatConversationListView({
  conversations,
  loading,
  onSelectConversation,
  onDeleteConversation,
}: AiChatConversationListViewProps) {
  const isLoadingSkeleton = loading && conversations.length === 0;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div className={cn("shrink-0 border-b border-border-subtle px-3 py-2")}>
        <Text size="sm" weight="medium">
          Conversations
        </Text>
      </div>

      <div className={cn("flex-1 overflow-auto")}>
        {isLoadingSkeleton ? (
          <div className={cn("p-3")}>
            <Skeleton variant="text" className={cn("mb-2 h-10")} />
            <Skeleton variant="text" className={cn("mb-2 h-10")} />
            <Skeleton variant="text" className={cn("h-10")} />
          </div>
        ) : conversations.length === 0 ? (
          <AiChatEmptyState variant="no-conversations" />
        ) : (
          <Stack gap="xs" className={cn("py-3")}>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors hover:bg-bg-surface-hover",
                )}
                onClick={() => onSelectConversation(conv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSelectConversation(conv.id);
                }}
              >
                <div className={cn("min-w-0 flex-1")}>
                  <Text size="sm" className={cn("truncate")}>
                    {conv.title || "Untitled"}
                  </Text>
                  <Text size="xs" color="muted">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                <IconButton
                  size="xs"
                  intent="quiet"
                  label="Delete conversation"
                  tooltip="Delete"
                  icon={<TrashIcon size={13} weight="regular" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                />
              </div>
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
