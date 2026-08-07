import type { useJobsListData } from "@/modules/jobs/list/hooks/useJobsListData";
import type { useJobsListFilters } from "@/modules/jobs/list/hooks/useJobsListFilters";

type JobsListFilters = ReturnType<typeof useJobsListFilters>;
type JobsListData = ReturnType<typeof useJobsListData>;

/** Shapes list data for rendering without depending on a query implementation. */
export function useJobsListViewModel(filters: JobsListFilters, data: JobsListData) {
  return {
    jobs: data.jobs,
    ...filters,
    loading: data.loading,
    error: data.error,
    showInitialLoading: data.loading && !data.hasData,
  };
}
