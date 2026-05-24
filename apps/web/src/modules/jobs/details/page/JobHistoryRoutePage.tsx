"use client";

import React from "react";

import { JobHistoryTabPage } from "@/modules/jobs/details/page/JobHistoryTabPage";

export default function JobHistoryRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobHistoryTabPage jobId={id} />;
}
