"use client";

import { Button, cn, Text } from "@job-tracker/ui";
import { ArrowLeftIcon, PlusIcon } from "@phosphor-icons/react";
import { type Ref, useCallback, useEffect, useRef } from "react";

import { useControllableState } from "@/modules/jobs/shared/hooks/useControllableState";
import { useChatPanelNavigation } from "@/modules/jobs/details/hooks/useChatPanelNavigation";

import { ChatPanelComposer, type ChatPanelComposerHandle } from "./ChatPanelComposer";
import { ChatPanelConversationList, type Conversation } from "./ChatPanelConversationList";
import { ChatPanelEmptyState } from "./ChatPanelEmptyState";
import { ChatPanelLayout } from "./ChatPanelLayout";
import { ChatPanelMessageList, type ChatMessage } from "./ChatPanelMessageList";
import { ChatPanelSkeleton } from "./ChatPanelSkeleton";

export type ChatPanelHandle = { focusComposer: () => void; scrollToBottom: () => void };

type ChatPanelConversationsProps = {
  conversations: Conversation[];
  conversationsLoading?: boolean;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isCreatingConversation?: boolean;
};

type ChatPanelActiveConversationProps = {
  activeConversationId?: string;
  defaultActiveConversationId?: string;
  onConversationChange?: (id: string) => void;
  onNavigateToConversation?: (id: string) => void;
};

type ChatPanelMessagesProps = {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onRetry?: () => void;
  isStreaming?: boolean;
  streamingContent?: string;
};

type ChatPanelNewConversationProps = {
  isNewConversation?: boolean;
  onNewConversationSend?: (content: string) => void;
  onNewConversationCancel?: () => void;
};

type ChatPanelProps = ChatPanelConversationsProps &
  ChatPanelActiveConversationProps &
  ChatPanelMessagesProps &
  ChatPanelNewConversationProps & { ref?: Ref<ChatPanelHandle> };

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
  const { showList, navigateToChat, navigateToList } = useChatPanelNavigation();

  const [activeConversationId, setActiveConversationId] = useControllableState({
    value: activeConversationIdProp,
    defaultValue: defaultActiveConversationId ?? conversations[0]?.id,
    onChange: onConversationChange,
  });

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (onNavigateToConversation) {
        onNavigateToConversation(id);
      } else {
        setActiveConversationId(id);
      }
      navigateToChat();
    },
    [setActiveConversationId, onNavigateToConversation, navigateToChat],
  );

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
    return <ChatPanelSkeleton />;
  }

  if (conversations.length === 0 && !isNewConversation) {
    return <ChatPanelEmptyState onCreateConversation={onCreateConversation} loading={isCreatingConversation} />;
  }

  const showSidebar = isNewConversation ? false : showList;

  const sidebarHeaderContent = (
    <div className={cn("shrink-0 border-b border-border-subtle px-3 py-2")}>
      {showSidebar ? (
        <Button
          size="sm"
          intent="ghost"
          onClick={onCreateConversation}
          state={isCreatingConversation ? "loading" : "default"}
        >
          <PlusIcon size={14} weight="bold" />
          New chat
        </Button>
      ) : (
        <Button
          intent="ghost"
          size="sm"
          onClick={isNewConversation ? onNewConversationCancel : navigateToList}
          leftIcon={<ArrowLeftIcon size={14} weight="bold" />}
        >
          Conversations
        </Button>
      )}
    </div>
  );

  const chatContent = isNewConversation ? (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <div className={cn("flex flex-1 items-center justify-center")}>
        <Text size="sm" color="muted">
          Send a message to start the conversation.
        </Text>
      </div>
      <ChatPanelComposer onSend={onNewConversationSend ?? onSendMessage} />
    </div>
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
      isNarrow
    />
  );

  return (
    <ChatPanelLayout
      sidebar={conversationList}
      main={chatContent}
      showSidebar={showSidebar}
      sidebarHeader={sidebarHeaderContent}
    />
  );
}
