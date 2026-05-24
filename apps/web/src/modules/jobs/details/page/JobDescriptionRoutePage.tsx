"use client";

import React from "react";

import { JobDescriptionPage } from "@/modules/jobs/details/page/JobDescriptionPage";

export default function JobDescriptionRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobDescriptionPage jobId={id} />;
}
