"use client";

import { useDraftApplicationDetailQuery } from "@/gql/hooks";
import { usePoll } from "@/hooks/usePoll";

export function useDraftApplicationDetailsViewModel(id: string) {
  const {
    data,
    loading,
    error,
    refetch,
    startPolling: spDraft,
    stopPolling: stpDraft,
  } = useDraftApplicationDetailQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
    skip: !id,
  });

  const draft = data?.draftApplication ?? null;
  const normalizedConversionStatus = draft?.conversionStatus?.toLowerCase();

  usePoll(
    { startPolling: spDraft, stopPolling: stpDraft },
    normalizedConversionStatus === "processing",
    2000,
  );

  return { draft, error, refetch, showInitialLoading: loading && !data };
}
