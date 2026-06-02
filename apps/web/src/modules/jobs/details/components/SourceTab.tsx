"use client";

import type { Route } from "next";

import type { JobSidePanel } from "@/modules/jobs/details/utils/job-details-routes";
import { jobDetailsHref, jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type SourceTabProps = { jobId: string; sidePanel?: JobSidePanel | null };

export function SourceTab({ jobId, sidePanel }: SourceTabProps) {
  const href: Route = sidePanel != null ? jobDetailsHref(jobId, "source", sidePanel) : jobDetailsPath(jobId, "source");
  return (
    <DetailsTabTrigger tab="source" href={href}>
      Source content
    </DetailsTabTrigger>
  );
}
