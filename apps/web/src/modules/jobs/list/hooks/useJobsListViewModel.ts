"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useJobsQuery } from "@/gql/hooks";
import { useCompanyFilter, useQuickFilter } from "@/modules/jobs/list/hooks/useQuickFilter";

export function useJobsListViewModel() {
  const searchParams = useSearchParams();
  const activeFilter = useQuickFilter();
  const companyFilter = useCompanyFilter();

  const runIdFilter = useMemo(() => {
    const raw = searchParams.get("runId")?.trim();
    return raw && raw.length > 0 ? raw : undefined;
  }, [searchParams]);

  const { data, loading, error } = useJobsQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      filter: activeFilter,
      company: companyFilter,
      runId: runIdFilter,
    },
  });

  const jobs = data?.jobs ?? [];

  return {
    jobs,
    activeFilter,
    companyFilter,
    runIdFilter,
    loading,
    error,
    showInitialLoading: loading && !data,
  };
}
