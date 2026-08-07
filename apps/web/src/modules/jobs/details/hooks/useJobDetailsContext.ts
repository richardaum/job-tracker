"use client";

import { createContext, useContext } from "react";

import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";

export interface JobDetailsContextValue {
  job: JobDetailsValues | undefined;
  sourcePrimaryText: string | null;
}

export const JobDetailsContext = createContext<JobDetailsContextValue | null>(null);

export function useJobDetailsContext(): JobDetailsContextValue {
  const value = useContext(JobDetailsContext);
  if (!value) throw new Error("useJobDetailsContext must be used within JobDetailsProvider");
  return value;
}
