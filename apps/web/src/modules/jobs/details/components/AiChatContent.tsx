"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";

import { JobHeaderActions } from "@/modules/jobs/details/job-details-header.slots";
import { useChatConversationQueryParam } from "@/modules/jobs/details/hooks/useChatConversationQueryParam";
import { useChatPanelViewModel } from "@/modules/jobs/details/hooks/useChatPanelViewModel";

import { AiChatChatView } from "./AiChatChatView";
import { AiChatConversationListView } from "./AiChatConversationListView";
import { AiChatEmptyState } from "./AiChatEmptyState";

type AiChatContentProps = { jobId: string; fullWidth?: boolean; className?: string };

/** Job AI chat root: conversation list, active chat, and URL sync. */
export function AiChatContent({ jobId, fullWidth, className }: AiChatContentProps) {
  const vm = useChatPanelViewModel(jobId);

  useChatConversationQueryParam(
    vm.activeConversationId,
    vm.conversations,
    vm.conversationsLoading,
    vm.switchConversation,
  );

  if (fullWidth) {
    return (
      <div className={cn("flex h-full min-h-0", className)} data-testid="ai-chat-content">
        <JobHeaderActions>
          <Button
            intent="primary"
            size="md"
            onClick={() => void vm.startNewConversation()}
            leftIcon={<PlusIcon size={14} weight="bold" />}
          >
            New Chat
          </Button>
        </JobHeaderActions>
        <div className={cn("flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-border-subtle")}>
          <AiChatConversationListView
            conversations={vm.conversations}
            loading={vm.loading}
            onSelectConversation={(id) => vm.switchConversation(id)}
            onDeleteConversation={(id) => void vm.deleteConversation(id)}
          />
        </div>

        {vm.hasActiveView ? (
          <div className={cn("flex-1 min-w-0")}>
            <AiChatChatView
              conversationId={vm.activeConversationId}
              messages={vm.messages}
              loading={vm.loading}
              conversationTitle={vm.conversationTitle}
              isStreaming={vm.isStreaming}
              isNewConversation={vm.isNewConversation}
              onSend={(content) => void vm.sendMessage(content)}
              onStopStreaming={vm.stopStreaming}
              disabled={vm.isSending}
              streamContent={vm.streamContent}
            />
          </div>
        ) : (
          <div className={cn("flex flex-1 items-center justify-center")}>
            <AiChatEmptyState variant="select-conversation" />
          </div>
        )}
      </div>
    );
  }

  if (!vm.hasActiveView) {
    return (
      <div className={cn("h-full min-h-0", className)} data-testid="ai-chat-content">
        <JobHeaderActions>
          <Button
            intent="primary"
            size="md"
            onClick={() => void vm.startNewConversation()}
            leftIcon={<PlusIcon size={14} weight="bold" />}
          >
            New Chat
          </Button>
        </JobHeaderActions>
        <AiChatConversationListView
          conversations={vm.conversations}
          loading={vm.loading}
          onSelectConversation={(id) => vm.switchConversation(id)}
          onDeleteConversation={(id) => void vm.deleteConversation(id)}
        />
      </div>
    );
  }

  return (
    <div className={cn("h-full min-h-0", className)} data-testid="ai-chat-content">
      <AiChatChatView
        conversationId={vm.activeConversationId}
        messages={vm.messages}
        loading={vm.loading}
        conversationTitle={vm.conversationTitle}
        onBack={() => vm.switchConversation(null)}
        isStreaming={vm.isStreaming}
        isNewConversation={vm.isNewConversation}
        onSend={(content) => void vm.sendMessage(content)}
        onStopStreaming={vm.stopStreaming}
        disabled={vm.isSending}
        streamContent={vm.streamContent}
      />
    </div>
  );
}
