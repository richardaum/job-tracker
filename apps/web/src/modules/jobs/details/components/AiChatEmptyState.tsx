"use client";

import { cn, Text } from "@job-tracker/ui";
import { ChatDotsIcon, RobotIcon } from "@phosphor-icons/react";

type AiChatEmptyStateVariant = "no-conversations" | "no-messages" | "select-conversation" | "new-conversation";

type AiChatEmptyStateProps = { variant: AiChatEmptyStateVariant; className?: string };

const variantConfig: Record<AiChatEmptyStateVariant, { icon: typeof ChatDotsIcon; message: string }> = {
  "no-conversations": { icon: ChatDotsIcon, message: "No conversations yet. Start a new chat to ask about this job." },
  "no-messages": { icon: RobotIcon, message: "No messages yet. Ask a question to get started." },
  "select-conversation": { icon: ChatDotsIcon, message: "Select or start a conversation" },
  "new-conversation": { icon: ChatDotsIcon, message: "Type your first message to begin" },
};

/** Placeholder for empty conversation list, chat thread, or selection state. */
export function AiChatEmptyState({ variant, className }: AiChatEmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 px-4 py-12", className)}
      data-testid="ai-chat-empty-state"
    >
      <Icon size={32} weight="duotone" className={cn("text-text-muted")} />
      <Text size="sm" color="muted" className={cn("text-center")}>
        {config.message}
      </Text>
    </div>
  );
}
