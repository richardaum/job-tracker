"use client";

import React from "react";

import { JobOverviewPage } from "@/modules/jobs/details/page/JobOverviewPage";

export default function JobOverviewRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobOverviewPage jobId={id} />;
}
