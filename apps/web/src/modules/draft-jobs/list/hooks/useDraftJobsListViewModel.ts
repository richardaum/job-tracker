"use client";

import { useDraftJobsListQuery } from "@/gql/hooks";

export function useDraftJobsListViewModel() {
  const { data, loading, error } = useDraftJobsListQuery({
    fetchPolicy: "cache-and-network",
  });

  const drafts = data?.draftJobs ?? [];

  return { drafts, loading, error, showInitialLoading: loading && !data };
}
