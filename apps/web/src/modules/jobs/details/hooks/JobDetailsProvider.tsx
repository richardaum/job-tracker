"use client";

import type { ReactNode } from "react";

import { JobDetailsContext, type JobDetailsContextValue } from "@/modules/jobs/details/hooks/useJobDetailsContext";

type JobDetailsProviderProps = JobDetailsContextValue & { children: ReactNode };

/** Shares layout-resolved job data with detail tab routes. */
export function JobDetailsProvider({ job, sourcePrimaryText, children }: JobDetailsProviderProps) {
  return <JobDetailsContext.Provider value={{ job, sourcePrimaryText }}>{children}</JobDetailsContext.Provider>;
}
