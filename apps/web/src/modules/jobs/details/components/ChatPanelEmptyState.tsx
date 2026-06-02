"use client";

import { Button, cn, Stack, Text } from "@job-tracker/ui";
import { ChatCircleTextIcon } from "@phosphor-icons/react";

type ChatPanelEmptyStateProps = {
  onCreateConversation: () => void;
  loading?: boolean;
};

export function ChatPanelEmptyState({ onCreateConversation, loading = false }: ChatPanelEmptyStateProps) {
  return (
    <div className={cn("flex h-full flex-col items-center justify-center gap-4 px-4")}>
      <ChatCircleTextIcon size={32} weight="duotone" className={cn("text-text-muted")} />
      <Stack gap="xs" align="center">
        <Text size="md" color="muted">
          No conversations yet
        </Text>
        <Text size="sm" color="muted">
          Start a new conversation to ask questions about this job.
        </Text>
      </Stack>
      <Button size="md" intent="primary" onClick={onCreateConversation} state={loading ? "loading" : "default"}>
        Start new conversation
      </Button>
    </div>
  );
}
