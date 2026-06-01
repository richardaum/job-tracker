"use client";

import { use } from "react";

import { JobNotesFocusPage } from "@/modules/jobs/details/page/JobNotesFocusPage";

type JobNotesFocusRoutePageProps = { params: Promise<{ id: string }> };

export default function JobNotesFocusRoutePage({ params }: JobNotesFocusRoutePageProps) {
  const { id } = use(params);
  return <JobNotesFocusPage jobId={id} />;
}
