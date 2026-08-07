"use client";

import type { ReactNode } from "react";
import { JobApiContext } from "@/modules/jobs/details/hooks/JobApiContext";

type JobApiProviderProps = { children: ReactNode };

export function JobDatabaseApiProvider({ children }: JobApiProviderProps) {
  return <JobApiContext.Provider value="database">{children}</JobApiContext.Provider>;
}

export function JobLocalApiProvider({ children }: JobApiProviderProps) {
  return <JobApiContext.Provider value="local">{children}</JobApiContext.Provider>;
}
