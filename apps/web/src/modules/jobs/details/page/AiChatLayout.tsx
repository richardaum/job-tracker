"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { AiChatProvider } from "@/modules/jobs/details/hooks/AiChatProvider";
import { useAiChatContext } from "@/modules/jobs/details/hooks/AiChatContext";
import { ChatPanelConversationList } from "@/modules/jobs/details/components/ChatPanelConversationList";
import { useSafeRouter } from "@/modules/jobs/details/hooks/useSafeRouter";

type AiChatLayoutProps = { children: ReactNode };

function AiChatLayoutInner({ children }: AiChatLayoutProps) {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const vm = useAiChatContext();
  const { push } = useSafeRouter();

  const handleNavigate = useCallback(
    (id: string) => {
      push(`/jobs/${jobId}/chat/${id}`);
    },
    [jobId, push],
  );

  const handleCreate = useCallback(() => {
    push(`/jobs/${jobId}/chat/new`);
  }, [jobId, push]);

  return (
    <div className={cn("flex h-full min-h-0 flex-1 overflow-hidden")}>
      <div className={cn("flex w-48 shrink-0 flex-col border-r border-border-subtle min-h-0")}>
        <div className={cn("shrink-0 border-b border-border-subtle p-2")}>
          <Button size="sm" intent="ghost" onClick={handleCreate}>
            <PlusIcon size={14} weight="bold" />
            New chat
          </Button>
        </div>
        <ChatPanelConversationList
          conversations={vm.conversations}
          onConversationChange={handleNavigate}
          onDeleteConversation={vm.deleteConversation}
          onCreateConversation={handleCreate}
          isCreatingConversation={vm.isCreatingConversation}
          isNarrow={true}
        />
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col")}>{children}</div>
    </div>
  );
}

export default function AiChatLayout({ children }: AiChatLayoutProps) {
  const params = useParams<{ id: string }>();
  return (
    <AiChatProvider jobId={params.id}>
      <AiChatLayoutInner>{children}</AiChatLayoutInner>
    </AiChatProvider>
  );
}
