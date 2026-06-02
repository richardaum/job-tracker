"use client";

import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { AiChatProvider, useAiChatContext } from "../hooks/AiChatContext";
import { ChatPanelConversationList } from "../components/ChatPanelConversationList";

type AiChatLayoutProps = { children: ReactNode };

function AiChatLayoutInner({ children }: AiChatLayoutProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const vm = useAiChatContext();

  const handleNavigate = useCallback(
    (id: string) => {
      router.push(`/jobs/${jobId}/chat/${id}` as Route);
    },
    [jobId, router],
  );

  const handleCreate = useCallback(async () => {
    const id = await vm.createConversation();
    if (id) router.push(`/jobs/${jobId}/chat/${id}` as Route);
  }, [vm, jobId, router]);

  return (
    <div className={cn("flex h-full min-h-0 flex-1 overflow-hidden")}>
      <div className={cn("flex w-48 shrink-0 flex-col border-r border-border-subtle min-h-0")}>
        <div className={cn("shrink-0 border-b border-border-subtle p-2")}>
          <Button size="sm" intent="ghost" onClick={handleCreate} state={vm.isCreatingConversation ? "loading" : "default"}>
            <PlusIcon size={14} weight="bold" />
            New chat
          </Button>
        </div>
        <ChatPanelConversationList
          conversations={vm.conversations}
          onConversationChange={handleNavigate}
          onDeleteConversation={vm.deleteConversation}
          onCreateConversation={vm.createConversation}
          isNarrow={true}
        />
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col")}>
        {children}
      </div>
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
