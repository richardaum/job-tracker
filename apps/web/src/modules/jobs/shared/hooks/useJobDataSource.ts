import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";
import type { JobPersistenceMode } from "@/modules/jobs/shared/types/jobPersistenceMode";

/** Uses local job data while the welcome tour is active. */
export function useJobDataSource(): JobPersistenceMode {
  const { activePhase } = useWelcomeTour();
  return activePhase ? "local" : "database";
}
