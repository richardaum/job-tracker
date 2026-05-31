"use client";

import { use } from "react";

import { JobSourcePage } from "@/modules/jobs/details/page/JobSourcePage";

type JobSourceRoutePageProps = { params: Promise<{ id: string }> };

export default function JobSourceRoutePage({
  params,
}: JobSourceRoutePageProps) {
  const { id } = use(params);
  return <JobSourcePage jobId={id} />;
}
