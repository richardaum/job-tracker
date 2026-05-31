"use client";

import { use } from "react";

import { JobNotesTabPage } from "@/modules/jobs/details/page/JobNotesTabPage";

type JobNotesRoutePageProps = { params: Promise<{ id: string }> };

export default function JobNotesRoutePage({ params }: JobNotesRoutePageProps) {
  const { id } = use(params);
  return <JobNotesTabPage jobId={id} />;
}
