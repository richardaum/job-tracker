"use client";

import React from "react";

import { JobNotesTabPage } from "@/modules/jobs/details/page/JobNotesTabPage";

export default function JobNotesRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <JobNotesTabPage jobId={id} />;
}
