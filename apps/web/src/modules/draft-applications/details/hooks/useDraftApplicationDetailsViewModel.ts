"use client";

import { useDraftApplicationDetailQuery } from "@/gql/hooks";

export function useDraftApplicationDetailsViewModel(id: string) {
  const { data, loading, error } = useDraftApplicationDetailQuery({
    variables: { id },
    fetchPolicy: "cache-and-network",
    skip: !id,
  });

  const draft = data?.draftApplication ?? null;

  return { draft, error, showInitialLoading: loading && !data };
}
