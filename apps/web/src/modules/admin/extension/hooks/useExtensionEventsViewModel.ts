"use client";

// TODO: Separate data fetching from data shaping.
// This hook bundles 2 subscriptions + 2 polls with view-model logic and is called
// independently from both ExtensionStatusPage and ExtensionEventsPage. When the
// user switches between admin extension tabs, Apollo tears down the old page's
// subscriptions/polls and recreates them on the new page.
//
// Fix: lift data fetching (subscriptions + polls) to a shared provider/context
// at the extension-tab level (AdminShell conditional or ExtensionLayout). Keep
// only data shaping (mergeExtensionAdminEvents, countInFlightAdminEvents, etc.)
// in this hook, consuming from context.
// Reference pattern: JobMatchStatusProvider + useJobMatchStatusValue.

import { useMemo } from "react";

import {
  useAdminExtensionActivityEventsListQuery,
  useAdminExtensionActivityEventsSubscription,
  useAdminSourceRunEventsSubscription,
  useAdminSourceRunsListQuery,
} from "@/gql/hooks";
import {
  ACTIVITY_EVENTS_LIMIT,
  countInFlightAdminEvents,
  mergeExtensionAdminEvents,
  SOURCE_RUN_POLL_INTERVAL_MS,
} from "@/modules/admin/extension/lib/extension-events.display";

export function useExtensionEventsViewModel() {
  const sourceRunsQuery = useAdminSourceRunsListQuery({
    fetchPolicy: "cache-and-network",
    pollInterval: SOURCE_RUN_POLL_INTERVAL_MS,
  });

  const activityQuery = useAdminExtensionActivityEventsListQuery({
    variables: { limit: ACTIVITY_EVENTS_LIMIT },
    fetchPolicy: "cache-and-network",
    pollInterval: SOURCE_RUN_POLL_INTERVAL_MS,
  });

  useAdminSourceRunEventsSubscription({
    onData: () => {
      void sourceRunsQuery.refetch();
    },
  });

  useAdminExtensionActivityEventsSubscription({
    onData: () => {
      void activityQuery.refetch();
    },
  });

  const events = useMemo(
    () =>
      mergeExtensionAdminEvents(
        sourceRunsQuery.data?.sourceRuns ?? [],
        activityQuery.data?.extensionActivityEvents ?? [],
      ),
    [sourceRunsQuery.data?.sourceRuns, activityQuery.data?.extensionActivityEvents],
  );

  const inFlightCount = countInFlightAdminEvents(events);
  const showInitialLoading =
    (sourceRunsQuery.loading && !sourceRunsQuery.data) ||
    (activityQuery.loading && !activityQuery.data);
  const error = sourceRunsQuery.error ?? activityQuery.error;

  function refetch() {
    return Promise.all([sourceRunsQuery.refetch(), activityQuery.refetch()]);
  }

  return { events, inFlightCount, error, showInitialLoading, refetch };
}
