"use client";

import { cn, TabsContent } from "@job-tracker/ui";

import { useChatPanelViewModel } from "@/modules/jobs/details/hooks/useChatPanelViewModel";

import { ChatPanel } from "./ChatPanel";

type ChatPanelTabsContentProps = { jobId: string; className?: string };

export function ChatPanelTabsContent({ jobId, className }: ChatPanelTabsContentProps) {
  const vm = useChatPanelViewModel(jobId);

  return (
    <TabsContent value="chat" className={cn("flex-1 min-h-0 overflow-hidden", className)}>
      <ChatPanel
        conversations={vm.conversations}
        messages={vm.messages}
        activeConversationId={vm.activeConversationId}
        isStreaming={vm.isStreaming}
        streamingContent={vm.streamingContent}
        isCreatingConversation={vm.isCreatingConversation}
        onConversationChange={vm.switchConversation}
        onCreateConversation={vm.createConversation}
        onDeleteConversation={vm.deleteConversation}
        onSendMessage={vm.askQuestion}
      />
    </TabsContent>
  );
}
