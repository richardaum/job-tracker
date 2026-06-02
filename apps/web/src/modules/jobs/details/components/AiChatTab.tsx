"use client";

import { jobDetailsHref } from "@/modules/jobs/details/utils/job-details-url";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type AiChatTabProps = { jobId: string; fullWidth?: boolean };

export function AiChatTab({ jobId, fullWidth }: AiChatTabProps) {
  const href = jobDetailsHref(`/jobs/${jobId}/chat`, { fullWidth });
  return (
    <DetailsTabTrigger tab="chat" href={href}>
      AI Chat
    </DetailsTabTrigger>
  );
}
