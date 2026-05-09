"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useApplicationsQuery } from "@/gql/hooks";
import {
  useCompanyFilter,
  useQuickFilter,
} from "@/modules/applications/list/hooks/useQuickFilter";

export function useApplicationsListViewModel() {
  const searchParams = useSearchParams();
  const activeFilter = useQuickFilter();
  const companyFilter = useCompanyFilter();

  const runIdFilter = useMemo(() => {
    const raw = searchParams.get("runId")?.trim();
    return raw && raw.length > 0 ? raw : undefined;
  }, [searchParams]);

  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      filter: activeFilter,
      company: companyFilter,
      runId: runIdFilter,
    },
  });

  const applications = data?.applications ?? [];

  return {
    applications,
    activeFilter,
    companyFilter,
    runIdFilter,
    loading,
    error,
    showInitialLoading: loading && !data,
  };
}
