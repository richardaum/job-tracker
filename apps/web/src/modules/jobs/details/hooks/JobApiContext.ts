import { createContext, useContext } from "react";

import type { JobPersistenceMode } from "@/modules/jobs/shared/types/jobPersistenceMode";

export const JobApiContext = createContext<JobPersistenceMode | null>(null);

export function useJobApiMode(): JobPersistenceMode {
  const mode = useContext(JobApiContext);
  if (!mode) {
    throw new Error("useJobApiMode must be used within a Job API provider.");
  }
  return mode;
}
