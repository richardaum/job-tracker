"use client";

import type { Route } from "next";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type SourceTabProps = { jobId: string; sidePanel?: string | null };

export function SourceTab({ jobId, sidePanel }: SourceTabProps) {
  const href: Route =
    sidePanel != null ? (`/jobs/${jobId}/source?s=${sidePanel}` as Route) : (`/jobs/${jobId}/source` as Route);
  return (
    <DetailsTabTrigger tab="source" href={href}>
      Source content
    </DetailsTabTrigger>
  );
}
