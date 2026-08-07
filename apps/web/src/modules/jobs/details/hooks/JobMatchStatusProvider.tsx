"use client";

import type { ReactNode } from "react";

import { JobMatchStatusContext, useJobMatchStatusValue } from "@/modules/jobs/details/hooks/useJobMatchStatus";

type JobMatchStatusProviderProps = { jobId: string; enabled?: boolean; children: ReactNode };

export function JobMatchStatusProvider({ jobId, enabled, children }: JobMatchStatusProviderProps) {
  const value = useJobMatchStatusValue(jobId, enabled);

  return <JobMatchStatusContext.Provider value={value}>{children}</JobMatchStatusContext.Provider>;
}
