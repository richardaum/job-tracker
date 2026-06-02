"use client";

import { useCallback, useEffect } from "react";

import { useChatPanelViewModel } from "@/modules/jobs/details/hooks/useChatPanelViewModel";
import { ChatPanel } from "@/modules/jobs/details/components/ChatPanel";
import { useSafeRouter } from "@/modules/jobs/details/hooks/useSafeRouter";

type AiChatTabPageProps = { jobId: string };

export function AiChatTabPage({ jobId }: AiChatTabPageProps) {
  const vm = useChatPanelViewModel(jobId);
  const { push } = useSafeRouter();

  const handleNavigate = useCallback(
    (id: string) => {
      push(`/jobs/${jobId}/chat/${id}`);
    },
    [jobId, push],
  );

  useEffect(() => {
    if (!vm.activeConversationId && vm.conversations[0]) {
      vm.switchConversation(vm.conversations[0].id);
    }
  }, [vm]);

  const handleCreate = useCallback(() => {
    push(`/jobs/${jobId}/chat/new`);
  }, [jobId, push]);

  return (
    <ChatPanel
      conversations={vm.conversations}
      messages={vm.messages}
      activeConversationId={vm.activeConversationId}
      defaultActiveConversationId={vm.conversations[0]?.id}
      isStreaming={vm.isStreaming}
      streamingContent={vm.streamingContent}
      isCreatingConversation={vm.isCreatingConversation}
      onNavigateToConversation={handleNavigate}
      onConversationChange={vm.switchConversation}
      onCreateConversation={handleCreate}
      onDeleteConversation={vm.deleteConversation}
      onSendMessage={vm.askQuestion}
    />
  );
}
