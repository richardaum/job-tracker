"use client";

import { cn } from "@job-tracker/ui";
import { useEffect } from "react";

import { useAiChatContext } from "@/modules/jobs/details/hooks/AiChatContext";
import { ChatPanelComposer } from "@/modules/jobs/details/components/ChatPanelComposer";
import { ChatPanelMessageList } from "@/modules/jobs/details/components/ChatPanelMessageList";

export default function AiChatDefaultPage() {
  const vm = useAiChatContext();

  useEffect(() => {
    if (!vm.activeConversationId && vm.conversations[0]) {
      vm.switchConversation(vm.conversations[0].id);
    }
  }, [vm]);

  if (vm.conversations.length === 0) {
    return (
      <div className={cn("flex h-full flex-1 min-h-0 flex-col items-center justify-center")}>
        <p className={cn("text-text-muted text-sm")}>No conversations yet</p>
      </div>
    );
  }

  if (!vm.activeConversationId) {
    return (
      <div className={cn("flex h-full flex-1 min-h-0 flex-col items-center justify-center")}>
        <p className={cn("text-text-muted text-sm")}>Select a conversation</p>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col")}>
      <ChatPanelMessageList
        messages={vm.messages}
        isStreaming={vm.isStreaming}
        streamingContent={vm.streamingContent}
      />
      <ChatPanelComposer
        onSend={vm.askQuestion}
        disabled={vm.isStreaming}
      />
    </div>
  );
}
