"use client";

import { use } from "react";

import { JobDescriptionPage } from "@/modules/jobs/details/page/JobDescriptionPage";

type JobDescriptionRoutePageProps = { params: Promise<{ id: string }> };

export default function JobDescriptionRoutePage({ params }: JobDescriptionRoutePageProps) {
  const { id } = use(params);
  return <JobDescriptionPage jobId={id} />;
}
