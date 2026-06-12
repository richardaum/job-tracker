"use client";

import { cn, Stack } from "@job-tracker/ui";

import { useChatMessageListScroll } from "@/modules/jobs/details/hooks/useChatMessageListScroll";

import { AiMessageBubble } from "./AiMessageBubble";
import { AiMessageRole } from "@/gql/hooks";

type MessageItem = { id: string; role: AiMessageRole; content: string; createdAt: string };

type AiChatMessageListProps = {
  conversationId: string | null;
  messages: MessageItem[];
  streamContent?: string;
  isStreaming?: boolean;
};

/** Scrollable message thread with auto-scroll during streaming. */
export function AiChatMessageList({
  conversationId,
  messages,
  streamContent = "",
  isStreaming = false,
}: AiChatMessageListProps) {
  const { scrollContainerRef } = useChatMessageListScroll({
    conversationId,
    messageCount: messages.length,
    isStreaming,
    streamContent,
  });

  return (
    <div ref={scrollContainerRef} className={cn("flex-1 overflow-auto")}>
      <div className={cn("mx-auto max-w-3xl p-3")}>
        <Stack gap="sm">
          {messages.map((msg) => (
            <AiMessageBubble key={msg.id} content={msg.content} role={msg.role} createdAt={msg.createdAt} />
          ))}
          {isStreaming && <AiMessageBubble content={streamContent} role={AiMessageRole.Assistant} isStreaming />}
        </Stack>
      </div>
    </div>
  );
}
