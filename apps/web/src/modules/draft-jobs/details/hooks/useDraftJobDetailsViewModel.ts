"use client";

import { ApplicationStage, type JobQuery, useJobQuery } from "@/gql/hooks";

export type DraftJobDetailsStatus = "idle" | "loading" | "success" | "error";

export function useDraftJobDetailsViewModel(id: string) {
  const { data, loading, error, refetch } = useJobQuery({
    variables: { id },
    skip: id.length === 0,
    fetchPolicy: "cache-and-network",
  });

  const draft: JobQuery["job"] | undefined = data?.job;
  const notFound = !loading && !draft;

  /** `/draft-jobs/:id` is only meaningful for rows still tagged as captures. */
  const wrongStage =
    !!draft && draft.currentStage !== ApplicationStage.Draft ? true : false;

  let status: DraftJobDetailsStatus = "idle";
  if (loading) {
    status = "loading";
  } else if (error) {
    status = "error";
  } else {
    status = "success";
  }

  return { draft, wrongStage, error, status, notFound, refetch };
}
