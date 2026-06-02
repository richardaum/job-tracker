"use client";

import type { Route } from "next";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useChatPanelViewModel } from "@/modules/jobs/details/hooks/useChatPanelViewModel";
import { ChatPanel } from "@/modules/jobs/details/components/ChatPanel";

type AiChatTabPageProps = { jobId: string };

export function AiChatTabPage({ jobId }: AiChatTabPageProps) {
  const router = useRouter();
  const vm = useChatPanelViewModel(jobId);

  const handleNavigate = useCallback(
    (id: string) => {
      router.push(`/jobs/${jobId}/chat/${id}` as Route);
    },
    [jobId, router],
  );

  useEffect(() => {
    if (!vm.activeConversationId && vm.conversations[0]) {
      vm.switchConversation(vm.conversations[0].id);
    }
  }, [vm]);

  const handleCreate = useCallback(async () => {
    const id = await vm.createConversation();
    if (id) router.push(`/jobs/${jobId}/chat/${id}` as Route);
  }, [vm, jobId, router]);

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
