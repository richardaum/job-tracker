"use client";

import React from "react";

import { JobNotesFocusPage } from "@/modules/jobs/details/page/JobNotesFocusPage";

export default function JobNotesFocusRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  return <JobNotesFocusPage jobId={id} />;
}
