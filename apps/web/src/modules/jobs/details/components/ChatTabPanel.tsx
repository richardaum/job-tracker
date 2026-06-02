"use client";

import { cn, TabsContent } from "@job-tracker/ui";
import { useCallback, useState } from "react";

import { useChatPanelViewModel } from "@/modules/jobs/details/hooks/useChatPanelViewModel";

import { ChatPanel } from "./ChatPanel";

type ChatTabPanelProps = { jobId: string; className?: string };

export function ChatTabPanel({ jobId, className }: ChatTabPanelProps) {
  const {
    conversations,
    conversationsLoading,
    messages,
    activeConversationId,
    isStreaming,
    streamingContent,
    isCreatingConversation,
    createAndSendFirstMessage,
    deleteConversation,
    switchConversation,
    askQuestion,
  } = useChatPanelViewModel(jobId);

  const [isNewConversation, setIsNewConversation] = useState(false);

  const handleNewConversationSend = useCallback(
    async (content: string) => {
      const newId = await createAndSendFirstMessage(content);
      if (newId) setIsNewConversation(false);
    },
    [createAndSendFirstMessage],
  );

  const handleNewConversationCancel = useCallback(() => {
    setIsNewConversation(false);
  }, []);

  const handleConversationChange = useCallback(
    (id: string) => {
      setIsNewConversation(false);
      switchConversation(id);
    },
    [switchConversation],
  );

  return (
    <TabsContent value="chat" className={cn("flex-1 min-h-0 overflow-hidden", className)}>
      <ChatPanel
        conversations={conversations}
        conversationsLoading={conversationsLoading}
        messages={messages}
        activeConversationId={activeConversationId}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        isCreatingConversation={isCreatingConversation}
        onConversationChange={handleConversationChange}
        onCreateConversation={() => setIsNewConversation(true)}
        onDeleteConversation={deleteConversation}
        onSendMessage={askQuestion}
        isNewConversation={isNewConversation}
        onNewConversationSend={handleNewConversationSend}
        onNewConversationCancel={handleNewConversationCancel}
      />
    </TabsContent>
  );
}
