"use client";

import type { ReactNode } from "react";

import { JobFillStatusContext, useJobFillStatusValue } from "@/modules/jobs/details/hooks/useJobFillStatus";

type JobFillStatusProviderProps = { jobId: string; enabled?: boolean; children: ReactNode };
export function JobFillStatusProvider({ jobId, enabled, children }: JobFillStatusProviderProps) {
  const value = useJobFillStatusValue(jobId, enabled);

  return <JobFillStatusContext.Provider value={value}>{children}</JobFillStatusContext.Provider>;
}
