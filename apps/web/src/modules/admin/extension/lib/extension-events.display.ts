import type { Badge } from "@job-tracker/ui";
import type { ComponentProps } from "react";

import {
  type AdminExtensionActivityEventsListQuery,
  type AdminSourceRunsListQuery,
  ExtensionActivityEventType,
  SourceRunEventType,
  SourceRunStatus,
} from "@/gql/hooks";

export type AdminSourceRunRow = AdminSourceRunsListQuery["sourceRuns"][number];

export type AdminActivityEventRow =
  AdminExtensionActivityEventsListQuery["extensionActivityEvents"][number];

export type ExtensionSourceRunEvent = {
  kind: "source_run";
  id: string;
  type: SourceRunEventType;
  status: SourceRunStatus;
  occurredAt: string;
  summary: string;
};

export type ExtensionActivityEvent = {
  kind: "activity";
  id: string;
  type: ExtensionActivityEventType;
  occurredAt: string;
  summary: string;
  correlationId: string | null;
};

export type ExtensionAdminEvent =
  | ExtensionSourceRunEvent
  | ExtensionActivityEvent;

const SOURCE_RUN_POLL_INTERVAL_MS = 5_000;
const ACTIVITY_EVENTS_LIMIT = 100;

export { ACTIVITY_EVENTS_LIMIT, SOURCE_RUN_POLL_INTERVAL_MS };

const OPEN_ACTIVITY_TYPES = new Set<ExtensionActivityEventType>([
  ExtensionActivityEventType.SourceRunReceived,
  ExtensionActivityEventType.SourceRunStarted,
  ExtensionActivityEventType.SourceRunJobImported,
  ExtensionActivityEventType.ImportJobStarted,
  ExtensionActivityEventType.AuthFailed,
]);

export function sourceRunSummary(run: AdminSourceRunRow): string {
  const profile = run.sourceProfile.trim();
  const surfaceUrl = run.surfaceUrl.trim();

  if (profile && surfaceUrl) return `${profile} · ${surfaceUrl}`;
  if (profile) return profile;
  if (surfaceUrl) return surfaceUrl;
  return run.sourceProfileId;
}

export function mapSourceRunToExtensionEvent(
  run: AdminSourceRunRow,
): ExtensionSourceRunEvent {
  return {
    kind: "source_run",
    id: run.id,
    type: SourceRunEventType.SourceRunCreated,
    status: run.status,
    occurredAt: String(run.startedAt),
    summary: sourceRunSummary(run),
  };
}

export function mapActivityToExtensionEvent(
  event: AdminActivityEventRow,
): ExtensionActivityEvent {
  return {
    kind: "activity",
    id: event.id,
    type: event.type,
    occurredAt: String(event.occurredAt),
    summary: event.summary,
    correlationId: event.correlationId ?? null,
  };
}

export function mergeExtensionAdminEvents(
  sourceRuns: AdminSourceRunRow[],
  activityEvents: AdminActivityEventRow[],
): ExtensionAdminEvent[] {
  const merged = [
    ...sourceRuns.map(mapSourceRunToExtensionEvent),
    ...activityEvents.map(mapActivityToExtensionEvent),
  ];

  return merged.sort(
    (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
  );
}

export function isInFlightSourceRunStatus(status: SourceRunStatus): boolean {
  return (
    status === SourceRunStatus.Running || status === SourceRunStatus.InProgress
  );
}

export function countInFlightSourceRunEvents(
  events: ExtensionSourceRunEvent[],
): number {
  return events.filter((event) => isInFlightSourceRunStatus(event.status))
    .length;
}

export function countInFlightActivityEvents(
  events: ExtensionActivityEvent[],
): number {
  const latestByCorrelation = new Map<string, ExtensionActivityEventType>();

  for (const event of [...events].sort(
    (left, right) => Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
  )) {
    const key = event.correlationId ?? event.id;
    latestByCorrelation.set(key, event.type);
  }

  let count = 0;
  for (const type of latestByCorrelation.values()) {
    if (OPEN_ACTIVITY_TYPES.has(type)) {
      count += 1;
    }
  }
  return count;
}

export function countInFlightAdminEvents(
  events: ExtensionAdminEvent[],
): number {
  const sourceRuns = events.filter(
    (event): event is ExtensionSourceRunEvent => event.kind === "source_run",
  );
  const activities = events.filter(
    (event): event is ExtensionActivityEvent => event.kind === "activity",
  );

  return (
    countInFlightSourceRunEvents(sourceRuns) +
    countInFlightActivityEvents(activities)
  );
}

export function inFlightLabel(count: number): string {
  if (count === 0) return "Idle";
  if (count === 1) return "1 in flight";
  return `${count} in flight`;
}

export function sourceRunStatusLabel(status: SourceRunStatus): string {
  return status.replaceAll("_", " ");
}

export function activityEventTypeLabel(
  type: ExtensionActivityEventType,
): string {
  return type.replaceAll("_", " ");
}

export function sourceRunStatusBadgeIntent(
  status: SourceRunStatus,
): ComponentProps<typeof Badge>["intent"] {
  switch (status) {
    case SourceRunStatus.Completed:
      return "success";
    case SourceRunStatus.Failed:
      return "error";
    case SourceRunStatus.Running:
    case SourceRunStatus.InProgress:
      return "info";
  }
}

export function activityEventBadgeIntent(
  type: ExtensionActivityEventType,
): ComponentProps<typeof Badge>["intent"] {
  switch (type) {
    case ExtensionActivityEventType.SourceRunCompleted:
    case ExtensionActivityEventType.ImportJobCompleted:
    case ExtensionActivityEventType.AuthRefreshed:
      return "success";
    case ExtensionActivityEventType.SourceRunFailed:
    case ExtensionActivityEventType.ImportJobFailed:
    case ExtensionActivityEventType.AuthFailed:
      return "error";
    case ExtensionActivityEventType.SourceRunClaimSkipped:
      return "warning";
    case ExtensionActivityEventType.SourceRunReceived:
    case ExtensionActivityEventType.SourceRunStarted:
    case ExtensionActivityEventType.SourceRunJobImported:
    case ExtensionActivityEventType.ImportJobStarted:
      return "info";
  }
}

export function adminEventTypeLabel(event: ExtensionAdminEvent): string {
  return event.kind === "source_run"
    ? event.type
    : activityEventTypeLabel(event.type);
}

export function adminEventSecondaryBadge(
  event: ExtensionAdminEvent,
): { label: string; intent: ComponentProps<typeof Badge>["intent"] } | null {
  if (event.kind === "source_run") {
    return {
      label: sourceRunStatusLabel(event.status),
      intent: sourceRunStatusBadgeIntent(event.status),
    };
  }
  return null;
}
