"use client";

import {
  cn,
  Dialog,
  Skeleton,
  Stack,
  Text,
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelineMarker,
} from "@job-tracker/ui";
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";

import { useSourceRunActivityEventsLiveSubscription, useSourceRunActivityEventsQuery } from "@/gql/hooks";
import { ExtensionActivityEventType } from "@/gql/graphql";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";

type SourceRunActivityEventsDialogProps = { runId: string; runLabel: string; trigger: ReactElement };

interface EventDisplayItem {
  type: string;
  summary: string;
  payload?: unknown;
  occurredAt: unknown;
}

function isSkipped(type: string, payload?: unknown): boolean {
  if (type === ExtensionActivityEventType.SourceRunJobSkipped) return true;
  if (
    type === ExtensionActivityEventType.SourceRunJobDetailsImport &&
    (payload as { duplicate?: boolean } | null)?.duplicate
  )
    return true;
  return false;
}

function statusColor(type: string, payload?: unknown): string {
  if (isSkipped(type, payload)) return "text-text-warning";
  if (type.endsWith("Failed")) return "text-text-error";
  if (
    type.endsWith("Completed") ||
    type === ExtensionActivityEventType.SourceRunJobDetailsImport ||
    type === ExtensionActivityEventType.SourceRunJobSurfaceImport
  )
    return "text-text-success";
  return "text-text-secondary";
}

export function SourceRunActivityEventsDialog({ runId, runLabel, trigger }: SourceRunActivityEventsDialogProps) {
  const [open, setOpen] = useState(false);

  const [liveEvents, setLiveEvents] = useState<EventDisplayItem[]>([]);
  const seenKeys = useRef(new Set<string>());

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setLiveEvents([]);
      seenKeys.current.clear();
    }
  }

  const { data: queryData, loading } = useSourceRunActivityEventsQuery({ variables: { runId }, skip: !open });

  useEffect(() => {
    if (!queryData?.sourceRunActivityEvents) return;
    for (const e of queryData.sourceRunActivityEvents) {
      seenKeys.current.add(`${e.type}-${e.summary}-${String(e.occurredAt)}`);
    }
  }, [queryData]);

  useSourceRunActivityEventsLiveSubscription({
    skip: !open,
    onData: ({ data }) => {
      const event = data.data?.extensionActivityEvents;
      if (!event || event.sourceRunId !== runId) return;

      const key = `${event.type}-${event.summary}-${String(event.occurredAt)}`;
      if (seenKeys.current.has(key)) return;
      seenKeys.current.add(key);

      setLiveEvents((prev) => [
        { type: event.type, summary: event.summary, payload: event.payload, occurredAt: event.occurredAt },
        ...prev,
      ]);
    },
  });

  const queryEvents = queryData?.sourceRunActivityEvents ?? [];
  const events = [...liveEvents, ...queryEvents];

  return (
    <Dialog
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      title={`Events — ${runLabel}`}
      size="4xl"
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 min-h-0 overflow-auto pe-3")}>
        {loading && events.length === 0 ? (
          <Stack gap="sm">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} variant="text" className={cn("h-10 w-full")} />
            ))}
          </Stack>
        ) : events.length === 0 ? (
          <Text size="sm" color="secondary">
            No events recorded for this run.
          </Text>
        ) : (
          <Timeline>
            {events.map((event, i) => (
              <TimelineItem key={`${event.occurredAt}-${i}`}>
                <TimelineMarker showTopConnector={i > 0} showBottomConnector={i < events.length - 1} />
                <TimelineContent className={cn(isSkipped(event.type, event.payload) && "!bg-bg-warning-subtle")}>
                  <div className={cn("flex items-start justify-between gap-2")}>
                    <div className={cn("min-w-0")}>
                      <Text size="sm" weight="medium" className={cn(statusColor(event.type, event.payload))}>
                        {event.summary}
                      </Text>
                      <Text size="xs" color="muted">
                        {event.type}
                        {isSkipped(event.type, event.payload) ? " · skipped" : null}
                      </Text>
                    </div>
                    <Text size="xs" color="muted" className={cn("shrink-0")}>
                      {formatDateTime(String(event.occurredAt))}
                    </Text>
                  </div>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </div>
    </Dialog>
  );
}
