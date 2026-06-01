"use client";

import type { ReactNode } from "react";

import { JobFillStatusContext, useJobFillStatusValue } from "@/modules/jobs/details/hooks/useJobFillStatus";

type JobFillStatusProviderProps = { jobId: string; children: ReactNode };
export function JobFillStatusProvider({ jobId, children }: JobFillStatusProviderProps) {
  const value = useJobFillStatusValue(jobId);

  return <JobFillStatusContext.Provider value={value}>{children}</JobFillStatusContext.Provider>;
}
