import { useJobsQuery } from "@/gql/hooks";

import type { useJobsListFilters } from "@/modules/jobs/list/hooks/useJobsListFilters";

type JobsListFilters = ReturnType<typeof useJobsListFilters>;

/** Database data source for the jobs list; local sources can later implement this same contract. */
export function useJobsListData({ activeFilter, companyFilter, runIdFilter }: JobsListFilters) {
  const { data, loading, error } = useJobsQuery({
    fetchPolicy: "cache-and-network",
    variables: { filter: activeFilter, company: companyFilter, runId: runIdFilter },
  });

  return { jobs: data?.jobs ?? [], loading, error, hasData: Boolean(data) };
}
