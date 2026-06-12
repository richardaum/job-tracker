"use client";

import { Button, cn, Skeleton, Text } from "@job-tracker/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { AiChatComposer } from "./AiChatComposer";
import { AiChatEmptyState } from "./AiChatEmptyState";
import { AiChatMessageList } from "./AiChatMessageList";
import { AiMessageRole } from "@/gql/hooks";

type MessageItem = { id: string; role: AiMessageRole; content: string; createdAt: string };

type AiChatChatViewProps = {
  conversationId: string | null;
  messages: MessageItem[];
  loading: boolean;
  conversationTitle: string;
  onBack?: () => void;
  streamContent?: string;
  isStreaming: boolean;
  isNewConversation?: boolean;
  onSend: (content: string) => void;
  onStopStreaming?: () => void;
  disabled: boolean;
};

/** Active conversation view: header, message list, composer, and streaming controls. */
export function AiChatChatView({
  conversationId,
  messages,
  loading,
  conversationTitle,
  onBack,
  streamContent,
  isStreaming,
  isNewConversation,
  onSend,
  onStopStreaming,
  disabled,
}: AiChatChatViewProps) {
  const isLoadingSkeleton = loading && messages.length === 0 && !isNewConversation;
  const isEmpty = !loading && messages.length === 0 && !isStreaming && !isNewConversation;

  return (
    <div className={cn("flex h-full min-h-0 flex-col")}>
      <div className={cn("flex shrink-0 items-center gap-2 border-b border-border-subtle px-3 py-2")}>
        {onBack && (
          <Button size="xs" intent="ghost" onClick={onBack} leftIcon={<ArrowLeftIcon size={14} weight="bold" />}>
            Back
          </Button>
        )}
        <Text size="sm" weight="bold" className={cn("truncate")}>
          {isNewConversation ? "New conversation" : conversationTitle || "Chat"}
        </Text>
      </div>

      {isNewConversation ? (
        <div className={cn("flex-1")}>
          <AiChatEmptyState variant="new-conversation" />
        </div>
      ) : isLoadingSkeleton ? (
        <div className={cn("flex-1 p-3")}>
          <Skeleton variant="text" className={cn("mb-2 h-12 w-3/4")} />
          <Skeleton variant="text" className={cn("mb-2 h-12 w-1/2")} />
          <Skeleton variant="text" className={cn("h-12 w-2/3")} />
        </div>
      ) : isEmpty ? (
        <div className={cn("flex-1")}>
          <AiChatEmptyState variant="no-messages" />
        </div>
      ) : (
        <AiChatMessageList
          conversationId={conversationId}
          messages={messages}
          streamContent={streamContent}
          isStreaming={isStreaming}
        />
      )}

      <div className={cn("shrink-0 border-t border-border-subtle px-3 py-2")}>
        <AiChatComposer onSend={onSend} disabled={isNewConversation ? false : disabled} isStreaming={isStreaming} />
        {isStreaming && onStopStreaming && (
          <div className={cn("mt-2 flex justify-center")}>
            <Button size="xs" intent="secondary" onClick={onStopStreaming}>
              Stop generating
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
