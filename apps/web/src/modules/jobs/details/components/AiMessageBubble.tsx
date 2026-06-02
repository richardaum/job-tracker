"use client";

import { Button, cn, Text } from "@job-tracker/ui";
import { RobotIcon } from "@phosphor-icons/react";

type AiMessageBubbleProps = {
  variant: "finalized" | "streaming" | "error";
  content: string;
  onRetry?: () => void;
};

export function AiMessageBubble({ variant, content, onRetry }: AiMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-2")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full bg-bg-surface-hover border border-border-subtle",
        )}
      >
        <RobotIcon size={14} weight="fill" className={cn("text-text-muted")} />
      </div>
      <div className={cn("max-w-[80%] rounded-2xl rounded-bl-sm border border-border-subtle bg-bg-surface px-3 py-2")}>
        {variant === "error" ? (
          <div className={cn("flex flex-col gap-2")}>
            <Text size="sm" color="muted">
              {content || "Failed to generate response"}
            </Text>
            {onRetry && (
              <Button size="sm" intent="secondary" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        ) : (
          <Text size="sm" color="primary" className={cn("whitespace-pre-wrap")}>
            {content}
            {variant === "streaming" && (
              <span data-testid="streaming-cursor" className={cn("animate-pulse ml-0.5 text-text-brand")}>▎</span>
            )}
          </Text>
        )}
      </div>
    </div>
  );
}
