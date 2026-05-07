"use client";

import { useDraftApplicationsListQuery } from "@/gql/hooks";

export function useDraftApplicationsListViewModel() {
  const { data, loading, error } = useDraftApplicationsListQuery({
    fetchPolicy: "cache-and-network",
  });

  const drafts = data?.draftApplications ?? [];

  return { drafts, loading, error, showInitialLoading: loading && !data };
}
