"use client";

import { Button, cn, Text } from "@job-tracker/ui";
import { RobotIcon } from "@phosphor-icons/react";
import { type ComponentType } from "react";

type MessageVariantProps = { content: string; onRetry?: () => void };

function FinalizedMessage({ content }: MessageVariantProps) {
  return (
    <Text size="sm" color="primary" className={cn("whitespace-pre-wrap")}>
      {content}
    </Text>
  );
}

function StreamingMessage({ content }: MessageVariantProps) {
  return (
    <Text size="sm" color="primary" className={cn("whitespace-pre-wrap")}>
      {content}
      <span data-testid="streaming-cursor" className={cn("animate-pulse ml-0.5 text-text-brand")}>
        ▎
      </span>
    </Text>
  );
}

function ErrorMessage({ content, onRetry }: MessageVariantProps) {
  return (
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
  );
}

const messageRenderers = {
  finalized: FinalizedMessage,
  streaming: StreamingMessage,
  error: ErrorMessage,
} as const satisfies Record<string, ComponentType<MessageVariantProps>>;

type AiMessageBubbleProps = { variant: keyof typeof messageRenderers; content: string; onRetry?: () => void };

export function AiMessageBubble({ variant, content, onRetry }: AiMessageBubbleProps) {
  const Component = messageRenderers[variant];

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
        <Component content={content} onRetry={onRetry} />
      </div>
    </div>
  );
}
