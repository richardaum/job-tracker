"use client";

import { useSyncExternalStore } from "react";

import { ApplicationQuickFilter, useJobsQuery } from "@/gql/hooks";

import type { useJobsListFilters } from "@/modules/jobs/list/hooks/useJobsListFilters";
import { useJobDataSource } from "@/modules/jobs/shared/hooks/useJobDataSource";
import { getWelcomeTourActiveJobs } from "@/modules/welcome-tour/welcomeTourJobList";
import {
  getWelcomeTourJobDraft,
  getWelcomeTourJobDraftRevision,
  subscribeToWelcomeTourJobDraft,
} from "@/modules/welcome-tour/welcomeTourJobDraft";

type JobsListFilters = ReturnType<typeof useJobsListFilters>;

/** Selects the database collection or the active local job collection for the jobs list. */
export function useJobsListData({ activeFilter, companyFilter, runIdFilter }: JobsListFilters) {
  const dataSource = useJobDataSource();
  const localJobs = useLocalJobsList(activeFilter, dataSource === "local");
  const useLocalJobs = localJobs.length > 0;
  const { data, loading, error } = useJobsQuery({
    fetchPolicy: "cache-and-network",
    skip: useLocalJobs,
    variables: { filter: activeFilter, company: companyFilter, runId: runIdFilter },
  });

  if (useLocalJobs) {
    return { jobs: localJobs, loading: false, error: undefined, hasData: true };
  }

  return { jobs: data?.jobs ?? [], loading, error, hasData: Boolean(data) };
}

/** Keeps the local data source reactive while its Active-filter examples are displayed. */
function useLocalJobsList(activeFilter: ApplicationQuickFilter | null, enabled: boolean) {
  useSyncExternalStore(subscribeToWelcomeTourJobDraft, getWelcomeTourJobDraftRevision, () => 0);

  if (!enabled || activeFilter !== ApplicationQuickFilter.Active) return [];

  const draft = getWelcomeTourJobDraft();
  return draft ? getWelcomeTourActiveJobs(draft) : [];
}
