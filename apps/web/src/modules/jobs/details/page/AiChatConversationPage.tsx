"use client";

import { cn } from "@job-tracker/ui";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useAiChatContext } from "@/modules/jobs/details/hooks/AiChatContext";
import { ChatPanelComposer } from "@/modules/jobs/details/components/ChatPanelComposer";
import { ChatPanelMessageList } from "@/modules/jobs/details/components/ChatPanelMessageList";

export default function AiChatConversationPage() {
  const params = useParams<{ id: string; conversationId: string }>();
  const conversationId = params.conversationId;
  const vm = useAiChatContext();
  const { switchConversation } = vm;

  useEffect(() => {
    switchConversation(conversationId);
  }, [conversationId, switchConversation]);

  if (!vm.conversations.find((c) => c.id === conversationId)) {
    return (
      <div className={cn("flex h-full flex-1 min-h-0 flex-col items-center justify-center")}>
        <p className={cn("text-text-muted text-sm")}>Conversation not found</p>
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
      <ChatPanelComposer onSend={vm.askQuestion} disabled={vm.isStreaming} />
    </div>
  );
}
