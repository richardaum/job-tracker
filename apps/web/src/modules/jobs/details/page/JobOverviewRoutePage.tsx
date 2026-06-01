"use client";

import { use } from "react";

import { JobOverviewPage } from "@/modules/jobs/details/page/JobOverviewPage";

type JobOverviewRoutePageProps = { params: Promise<{ id: string }> };

export default function JobOverviewRoutePage({ params }: JobOverviewRoutePageProps) {
  const { id } = use(params);
  return <JobOverviewPage jobId={id} />;
}
