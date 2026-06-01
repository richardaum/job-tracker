"use client";

import { use } from "react";

import { JobMatchPage } from "@/modules/jobs/details/page/JobMatchPage";

type JobMatchRoutePageProps = { params: Promise<{ id: string }> };

export default function JobMatchRoutePage({ params }: JobMatchRoutePageProps) {
  const { id } = use(params);
  return <JobMatchPage jobId={id} />;
}
