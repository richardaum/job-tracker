import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import {
  type UseJobDetailsViewModelOptions,
  useJobDetailsViewModel,
} from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { useWelcomeTourJobDetailsViewModel } from "@/modules/welcome-tour/useWelcomeTourJobDetailsViewModel";

/** Selects the database or welcome-tour job details source without changing hook order. */
export function useJobDetails(jobId: string, options?: UseJobDetailsViewModelOptions) {
  const isLocal = useJobDataSource() === "local";
  const database = useJobDetailsViewModel(jobId, { ...options, skip: isLocal || options?.skip });
  const local = useWelcomeTourJobDetailsViewModel(isLocal);

  return isLocal ? local : database;
}
