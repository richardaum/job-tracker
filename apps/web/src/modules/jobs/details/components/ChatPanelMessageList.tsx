"use client";

import { cn, Text } from "@job-tracker/ui";
import { useEffect, useRef } from "react";

import { AiMessageBubble } from "./AiMessageBubble";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

type ChatPanelMessageListProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  streamingContent?: string;
  onRetry?: () => void;
};

export function ChatPanelMessageList({ messages, isStreaming = false, streamingContent = "", onRetry }: ChatPanelMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (messages.length > previousMessageCountRef.current || isStreaming) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    previousMessageCountRef.current = messages.length;
  }, [messages.length, isStreaming, streamingContent]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className={cn("flex flex-1 items-center justify-center")}>
        <Text size="sm" color="muted">
          Send a message to start the conversation.
        </Text>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 overflow-y-auto p-3")}>
      <div className={cn("flex flex-col gap-3")}>
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} data-testid="user-message" className={cn("flex justify-end")}>
              <div
                className={cn("max-w-[80%] rounded-2xl rounded-br-sm bg-bg-brand px-3 py-2")}
              >
                <span className={cn("whitespace-pre-wrap text-sm text-text-inverted")}>
                  {msg.content}
                </span>
              </div>
            </div>
          ) : (
            <AiMessageBubble key={msg.id} variant="finalized" content={msg.content} onRetry={onRetry} />
          ),
        )}

        {isStreaming && (
          <AiMessageBubble
            variant="streaming"
            content={streamingContent || "AI is thinking..."}
            onRetry={onRetry}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
