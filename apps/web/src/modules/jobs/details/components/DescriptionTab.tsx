"use client";

import type { Route } from "next";

import type { JobSidePanel } from "@/modules/jobs/details/utils/job-details-routes";
import { jobDetailsHref, jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type DescriptionTabProps = { jobId: string; sidePanel?: JobSidePanel | null };

export function DescriptionTab({ jobId, sidePanel }: DescriptionTabProps) {
  const href: Route = sidePanel != null ? jobDetailsHref(jobId, "description", sidePanel) : jobDetailsPath(jobId, "description");
  return (
    <DetailsTabTrigger tab="description" href={href}>
      Description
    </DetailsTabTrigger>
  );
}
