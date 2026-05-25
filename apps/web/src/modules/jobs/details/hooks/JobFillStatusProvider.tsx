"use client";

import type { ReactNode } from "react";

import {
  JobFillStatusContext,
  useJobFillStatusValue,
} from "@/modules/jobs/details/hooks/useJobFillStatus";

export function JobFillStatusProvider({
  jobId,
  children,
}: {
  jobId: string;
  children: ReactNode;
}) {
  const value = useJobFillStatusValue(jobId);

  return (
    <JobFillStatusContext.Provider value={value}>
      {children}
    </JobFillStatusContext.Provider>
  );
}
