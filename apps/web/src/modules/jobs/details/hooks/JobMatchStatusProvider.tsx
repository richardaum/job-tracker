"use client";

import type { ReactNode } from "react";

import {
  JobMatchStatusContext,
  useJobMatchStatusValue,
} from "@/modules/jobs/details/hooks/useJobMatchStatus";

export function JobMatchStatusProvider({
  jobId,
  children,
}: {
  jobId: string;
  children: ReactNode;
}) {
  const value = useJobMatchStatusValue(jobId);

  return (
    <JobMatchStatusContext.Provider value={value}>
      {children}
    </JobMatchStatusContext.Provider>
  );
}
