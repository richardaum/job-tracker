"use client";

import { useDraftJobDetailQuery } from "@/gql/hooks";

export function useDraftJobDetailsViewModel(id: string) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useDraftJobDetailQuery({
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    });

  const draft = data?.draftJob ?? null;

  return {
    draft,
    error,
    refetch,
    showInitialLoading: loading && !data,
    startPolling,
    stopPolling,
  };
}
