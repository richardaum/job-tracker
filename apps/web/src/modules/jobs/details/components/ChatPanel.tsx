"use client";

import { Button, cn, Skeleton, Text } from "@job-tracker/ui";
import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { type Ref, useCallback, useEffect, useRef, useState } from "react";

import { useControllableState } from "@/modules/jobs/shared/hooks/useControllableState";

import { ChatPanelComposer, type ChatPanelComposerHandle } from "./ChatPanelComposer";
import { ChatPanelConversationList, type Conversation } from "./ChatPanelConversationList";
import { ChatPanelMessageList, type ChatMessage } from "./ChatPanelMessageList";

export type ChatPanelHandle = { focusComposer: () => void; scrollToBottom: () => void };

type ChatPanelProps = {
  conversations: Conversation[];
  conversationsLoading?: boolean;
  messages: ChatMessage[];
  activeConversationId?: string;
  defaultActiveConversationId?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  isCreatingConversation?: boolean;
  onConversationChange?: (id: string) => void;
  onNavigateToConversation?: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (content: string) => void;
  onNewConversationSend?: (content: string) => void;
  isNewConversation?: boolean;
  onNewConversationCancel?: () => void;
  onRetry?: () => void;
  ref?: Ref<ChatPanelHandle>;
};

export function ChatPanel({
  conversations,
  conversationsLoading = false,
  messages,
  activeConversationId: activeConversationIdProp,
  defaultActiveConversationId,
  isStreaming = false,
  streamingContent = "",
  isCreatingConversation = false,
  onConversationChange,
  onNavigateToConversation,
  onCreateConversation,
  onDeleteConversation,
  onSendMessage,
  onNewConversationSend,
  isNewConversation = false,
  onNewConversationCancel,
  onRetry,
  ref,
}: ChatPanelProps) {
  const composerRef = useRef<ChatPanelComposerHandle>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [showList, setShowList] = useState(true);

  const [activeConversationId, setActiveConversationId] = useControllableState({
    value: activeConversationIdProp,
    defaultValue: defaultActiveConversationId ?? conversations[0]?.id,
    onChange: onConversationChange,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width;
        setIsNarrow(width < 480);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (onNavigateToConversation) {
        onNavigateToConversation(id);
      } else {
        setActiveConversationId(id);
      }
      if (isNarrow) setShowList(false);
    },
    [setActiveConversationId, isNarrow, onNavigateToConversation],
  );

  const handleBackToList = useCallback(() => {
    setShowList(true);
  }, []);

  const setPanelRef = useCallback(
    (instance: ChatPanelHandle | null) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(instance);
      } else {
        (ref as React.RefObject<ChatPanelHandle | null>).current = instance;
      }
    },
    [ref],
  );

  useEffect(() => {
    const handle: ChatPanelHandle = {
      focusComposer: () => composerRef.current?.focus(),
      scrollToBottom: () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }),
    };
    setPanelRef(handle);
    return () => {
      setPanelRef(null);
    };
  }, [setPanelRef]);

  if (conversationsLoading) {
    return (
      <div ref={containerRef} className={cn("flex h-full min-h-0 flex-col")}>
        {isNarrow ? (
          <div className={cn("flex h-full flex-col gap-2 p-3")}>
            <Skeleton variant="text" className={cn("h-8 w-full max-w-32")} />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" className={cn("h-5 w-full")} />
            ))}
          </div>
        ) : (
          <div className={cn("flex min-h-0 flex-1")}>
            <div className={cn("flex w-48 flex-col gap-2 border-r border-border-subtle p-3")}>
              <Skeleton variant="text" className={cn("h-8 w-full")} />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" className={cn("h-5 w-full")} />
              ))}
            </div>
            <div className={cn("flex flex-1 items-center justify-center p-3")}>
              <Skeleton variant="text" className={cn("h-4 w-48")} />
            </div>
          </div>
        )}
      </div>
    );
  }

  const newConversationContent = (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <div className={cn("flex flex-1 items-center justify-center")}>
        <Text size="sm" color="muted">
          Send a message to start the conversation.
        </Text>
      </div>
      <ChatPanelComposer onSend={onNewConversationSend ?? onSendMessage} />
    </div>
  );

  const chatContent = isNewConversation ? (
    newConversationContent
  ) : (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <ChatPanelMessageList
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onRetry={onRetry}
      />
      <div ref={messagesEndRef} />
      <ChatPanelComposer ref={composerRef} onSend={onSendMessage} disabled={isStreaming} />
    </div>
  );

  const conversationList = (
    <ChatPanelConversationList
      conversations={conversations}
      activeConversationId={activeConversationId}
      onConversationChange={handleSelectConversation}
      onDeleteConversation={onDeleteConversation}
      onCreateConversation={onCreateConversation}
      isCreatingConversation={isCreatingConversation}
      isNarrow={isNarrow}
    />
  );

  return (
    <div ref={containerRef} className={cn("flex h-full min-h-0 flex-col")}>
      {isNarrow ? (
        isNewConversation || !showList ? (
          <div className={cn("flex min-h-0 flex-1 flex-col")}>
            {isNewConversation ? (
              <div className={cn("shrink-0 border-b border-border-subtle px-3 py-2")}>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={onNewConversationCancel ?? handleBackToList}
                  leftIcon={<ArrowLeftIcon size={14} weight="bold" />}
                >
                  Conversations
                </Button>
              </div>
            ) : (
              <div className={cn("shrink-0 border-b border-border-subtle px-3 py-2")}>
                <Button
                  intent="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  leftIcon={<ArrowLeftIcon size={14} weight="bold" />}
                >
                  Conversations
                </Button>
              </div>
            )}
            {chatContent}
          </div>
        ) : (
          <div className={cn("flex min-h-0 flex-1 flex-col")}>
            <div className={cn("shrink-0 border-b border-border-subtle px-3 py-2")}>
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
            {conversationList}
          </div>
        )
      ) : (
        <div className={cn("flex min-h-0 flex-1")}>
          {conversationList}
          {chatContent}
        </div>
      )}
    </div>
  );
}
