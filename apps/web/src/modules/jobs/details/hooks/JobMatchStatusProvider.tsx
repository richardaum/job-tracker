"use client";

import type { ReactNode } from "react";

import { JobMatchStatusContext, useJobMatchStatusValue } from "@/modules/jobs/details/hooks/useJobMatchStatus";

type JobMatchStatusProviderProps = { jobId: string; children: ReactNode };

export function JobMatchStatusProvider({ jobId, children }: JobMatchStatusProviderProps) {
  const value = useJobMatchStatusValue(jobId);

  return <JobMatchStatusContext.Provider value={value}>{children}</JobMatchStatusContext.Provider>;
}
