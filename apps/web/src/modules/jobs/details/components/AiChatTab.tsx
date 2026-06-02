"use client";

import { SparkleIcon } from "@phosphor-icons/react";
import type { Route } from "next";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type AiChatTabProps = { jobId: string; fullWidth?: boolean };

export function AiChatTab({ jobId, fullWidth }: AiChatTabProps) {
  const href = fullWidth ? (`/jobs/${jobId}/chat?w=full` as Route) : (`/jobs/${jobId}/chat` as Route);
  return (
    <DetailsTabTrigger tab="chat" href={href} leadingIcon={<SparkleIcon size={14} weight="regular" />}>
      AI Chat
    </DetailsTabTrigger>
  );
}
