"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { type ReactNode, useCallback } from "react";

import { AiChatProvider } from "@/modules/jobs/details/hooks/AiChatProvider";
import { useAiChatContext } from "@/modules/jobs/details/hooks/AiChatContext";
import { ChatPanelConversationList } from "@/modules/jobs/details/components/ChatPanelConversationList";
import { ChatPanelLayout } from "@/modules/jobs/details/components/ChatPanelLayout";
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
    <ChatPanelLayout
      sidebar={
        <ChatPanelConversationList
          conversations={vm.conversations}
          onConversationChange={handleNavigate}
          onDeleteConversation={vm.deleteConversation}
          onCreateConversation={handleCreate}
          isCreatingConversation={vm.isCreatingConversation}
          isNarrow
        />
      }
      main={children}
      showSidebar
      sidebarHeader={
        <div className={cn("shrink-0 border-b border-border-subtle p-2")}>
          <Button size="sm" intent="ghost" onClick={handleCreate}>
            <PlusIcon size={14} weight="bold" />
            New chat
          </Button>
        </div>
      }
    />
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
