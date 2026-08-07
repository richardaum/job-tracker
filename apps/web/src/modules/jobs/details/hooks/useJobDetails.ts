import { useJobApiMode } from "@/modules/jobs/details/hooks/JobApiContext";
import {
  type UseJobDetailsViewModelOptions,
  useJobDetailsViewModel,
} from "@/modules/jobs/details/hooks/useJobDetailsViewModel";
import { useWelcomeTourJobDetailsViewModel } from "@/modules/welcome-tour/useWelcomeTourJobDetailsViewModel";

/** Selects the database or welcome-tour job details source without changing hook order. */
export function useJobDetails(jobId: string, options?: UseJobDetailsViewModelOptions) {
  const mode = useJobApiMode();
  const isLocal = mode === "local";
  const database = useJobDetailsViewModel(jobId, { ...options, skip: isLocal || options?.skip });
  const local = useWelcomeTourJobDetailsViewModel(isLocal);

  return isLocal ? local : database;
}
