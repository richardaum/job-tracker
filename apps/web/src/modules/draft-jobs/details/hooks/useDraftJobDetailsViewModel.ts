"use client";

import { useDraftJobDetailQuery } from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useDraftJobDetailsViewModel(id: string) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useDraftJobDetailQuery({
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    });

  const draft = data?.draftJob ?? null;
  const status = deriveDetailStatus(loading, error);

  return {
    draft,
    error,
    refetch,
    notFound: status === "notFound",
    status,
    startPolling,
    stopPolling,
  };
}
