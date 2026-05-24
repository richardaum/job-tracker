"use client";

import React from "react";

import { JobSourcePage } from "@/modules/jobs/details/page/JobSourcePage";

export default function JobSourceRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobSourcePage jobId={id} />;
}
