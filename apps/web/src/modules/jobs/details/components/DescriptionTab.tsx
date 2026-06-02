"use client";

import type { Route } from "next";

import { DetailsTabTrigger } from "./DetailsTabTrigger";

type DescriptionTabProps = { jobId: string; sidePanel?: string | null };

export function DescriptionTab({ jobId, sidePanel }: DescriptionTabProps) {
  const href: Route =
    sidePanel != null
      ? (`/jobs/${jobId}/description?s=${sidePanel}` as Route)
      : (`/jobs/${jobId}/description` as Route);
  return (
    <DetailsTabTrigger tab="description" href={href}>
      Description
    </DetailsTabTrigger>
  );
}
