"use client";

import { ApplicationQuickFilter, useJobsQuery } from "@/gql/hooks";

export function useDraftJobsListViewModel() {
  const { data, loading, error } = useJobsQuery({
    fetchPolicy: "cache-and-network",
    variables: { filter: ApplicationQuickFilter.Draft },
  });

  const drafts = data?.jobs ?? [];

  return { drafts, error, showInitialLoading: loading && !data };
}
