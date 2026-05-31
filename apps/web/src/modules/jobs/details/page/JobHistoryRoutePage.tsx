"use client";

import { use } from "react";

import { JobHistoryTabPage } from "@/modules/jobs/details/page/JobHistoryTabPage";

type JobHistoryRoutePageProps = { params: Promise<{ id: string }> };

export default function JobHistoryRoutePage({ params }: JobHistoryRoutePageProps) {
  const { id } = use(params);
  return <JobHistoryTabPage jobId={id} />;
}
