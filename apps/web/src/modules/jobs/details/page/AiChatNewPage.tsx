"use client";

import { cn } from "@job-tracker/ui";
import { useCallback } from "react";

import { useAiChatContext } from "@/modules/jobs/details/hooks/AiChatContext";
import { ChatPanelComposer } from "@/modules/jobs/details/components/ChatPanelComposer";
import { useSafeRouter } from "@/modules/jobs/details/hooks/useSafeRouter";
import { useParams } from "next/navigation";

export default function AiChatNewPage() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const vm = useAiChatContext();
  const { createAndSendFirstMessage } = vm;
  const { push } = useSafeRouter();

  const handleSend = useCallback(
    async (content: string) => {
      const newId = await createAndSendFirstMessage(content);
      if (newId) {
        push(`/jobs/${jobId}/chat/${newId}`);
      }
    },
    [createAndSendFirstMessage, jobId, push],
  );

  return (
    <div className={cn("flex h-full flex-1 min-h-0 flex-col")}>
      <div className={cn("flex flex-1 items-center justify-center")}>
        <p className={cn("text-text-muted text-sm")}>Send a message to start the conversation.</p>
      </div>
      <ChatPanelComposer onSend={handleSend} />
    </div>
  );
}
