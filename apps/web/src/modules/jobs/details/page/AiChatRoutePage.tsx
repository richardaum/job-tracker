"use client";

import { use } from "react";

import { AiChatTabPage } from "@/modules/jobs/details/page/AiChatTabPage";

type AiChatRoutePageProps = { params: Promise<{ id: string }> };

export default function AiChatRoutePage({ params }: AiChatRoutePageProps) {
  const { id } = use(params);
  return <AiChatTabPage jobId={id} />;
}
