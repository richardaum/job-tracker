"use client";

import { useEffect } from "react";

import { useDraftApplicationDetailQuery } from "@/gql/hooks";

export function useDraftApplicationDetailsViewModel(id: string) {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useDraftApplicationDetailQuery({
      variables: { id },
      fetchPolicy: "cache-and-network",
      skip: !id,
    });

  const draft = data?.draftApplication ?? null;
  const normalizedConversionStatus = draft?.conversionStatus?.toLowerCase();

  useEffect(() => {
    if (normalizedConversionStatus === "processing") {
      startPolling(2000);
      return () => stopPolling();
    }
    stopPolling();
  }, [normalizedConversionStatus, startPolling, stopPolling]);

  return { draft, error, refetch, showInitialLoading: loading && !data };
}
