"use client";

import { use } from "react";

import { JobAiChatTabPage } from "@/modules/jobs/details/page/JobAiChatTabPage";

type JobAiChatRoutePageProps = { params: Promise<{ id: string }> };

/** Next.js route entry for `/jobs/[id]/chat`. */
export default function JobAiChatRoutePage({ params }: JobAiChatRoutePageProps) {
  const { id } = use(params);
  return <JobAiChatTabPage jobId={id} />;
}
