"use client";

import React from "react";

import { JobMatchPage } from "@/modules/jobs/details/page/JobMatchPage";

export default function JobMatchRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobMatchPage jobId={id} />;
}
