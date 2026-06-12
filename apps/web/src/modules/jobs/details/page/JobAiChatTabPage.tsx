"use client";

import { cn } from "@job-tracker/ui";
import { useSearchParams } from "next/navigation";

import { AiChatContent } from "@/modules/jobs/details/components/AiChatContent";

type JobAiChatTabPageProps = { jobId: string; fullWidth?: boolean };

/** Full-page AI chat layout with optional full-width sidebar mode. */
export function JobAiChatTabPage({ jobId, fullWidth }: JobAiChatTabPageProps) {
  const searchParams = useSearchParams();
  const isFullWidth = fullWidth ?? searchParams.get("w") === "full";

  return (
    <div className={cn("mt-3 flex flex-1 min-h-0 flex-col overflow-hidden")}>
      <AiChatContent jobId={jobId} fullWidth={isFullWidth} />
    </div>
  );
}
