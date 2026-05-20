"use client";

import { useDraftApplicationDetailQuery } from "@/gql/hooks";
import { deriveDetailStatus } from "@/lib/entity-detail-view-status";

export function useDraftApplicationDetailsViewModel(id: string) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useDraftApplicationDetailQuery({
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    });

  const draft = data?.draftApplication ?? null;
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
