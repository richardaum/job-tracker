"use client";

import { useApplicationsQuery } from "@/gql/hooks";
import {
  useCompanyFilter,
  useQuickFilter,
} from "@/modules/applications/list/hooks/useQuickFilter";

export function useApplicationsListViewModel() {
  const activeFilter = useQuickFilter();
  const companyFilter = useCompanyFilter();

  const { data, loading, error } = useApplicationsQuery({
    fetchPolicy: "cache-and-network",
    variables: { filter: activeFilter, company: companyFilter },
  });

  const applications = data?.applications ?? [];

  return {
    applications,
    activeFilter,
    companyFilter,
    loading,
    error,
    showInitialLoading: loading && !data,
  };
}
