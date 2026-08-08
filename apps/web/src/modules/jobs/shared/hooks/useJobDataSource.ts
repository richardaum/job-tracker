import { useTour } from "@/modules/tour/useTour";
import type { JobPersistenceMode } from "@/modules/jobs/shared/types/jobPersistenceMode";

/** Resolves the Job data source declared by the active welcome tour. */
export function useJobDataSource(): JobPersistenceMode {
  const { activeTour } = useTour();
  return activeTour?.dataSources?.job === "local" ? "local" : "database";
}
