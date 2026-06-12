"use client";

import { AiMessageRole } from "@/gql/hooks";
import { Button, cn, Text, Tooltip } from "@job-tracker/ui";
import { ChatDotsIcon } from "@phosphor-icons/react";

type AiMessageBubbleProps = {
  content: string;
  role: AiMessageRole;
  createdAt?: string;
  isStreaming?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Single user or assistant message bubble with optional timestamp and retry. */
export function AiMessageBubble({
  content,
  role,
  createdAt,
  isStreaming = false,
  hasError = false,
  onRetry,
}: AiMessageBubbleProps) {
  const isUser = role === AiMessageRole.User;
  const showError = hasError && !isUser;

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      data-testid={`message-bubble-${isUser ? "user" : "assistant"}`}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2",
          isUser ? "bg-bg-brand-subtle rounded-br-sm" : "bg-bg-surface-hover rounded-bl-sm",
        )}
      >
        <div className={cn("flex items-start gap-2")}>
          {!isUser && <ChatDotsIcon size={16} weight="regular" className={cn("mt-1 shrink-0 text-text-muted")} />}
          <div className={cn("min-w-0")}>
            {showError ? (
              <div className={cn("flex flex-col gap-2")}>
                <Text size="sm" color="muted">
                  Failed to generate
                </Text>
                {onRetry && (
                  <Button size="xs" intent="secondary" onClick={onRetry}>
                    Retry
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Text size="sm" className={cn("whitespace-pre-wrap wrap-break-word")}>
                  {content}
                  {isStreaming && <span className={cn("inline-block ml-0.5 w-2 h-4 bg-current animate-pulse")} />}
                </Text>
                {createdAt && !isStreaming && (
                  <Tooltip content={formatFullDate(createdAt)}>
                    <span className={cn("mt-0.5 inline-block text-xs text-text-muted select-none")}>
                      {formatTime(createdAt)}
                    </span>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
