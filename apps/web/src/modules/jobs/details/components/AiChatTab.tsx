"use client";

import { SparkleIcon } from "@phosphor-icons/react";

import { jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";
import { DetailsTabTrigger } from "./DetailsTabTrigger";

type AiChatTabProps = { jobId: string };

export function AiChatTab({ jobId }: AiChatTabProps) {
  return (
    <DetailsTabTrigger tab="chat" href={jobDetailsPath(jobId, "chat")} leadingIcon={<SparkleIcon size={14} weight="regular" />}>
      AI Chat
    </DetailsTabTrigger>
  );
}
