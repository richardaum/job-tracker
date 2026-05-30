"use client";

import { cn, Dialog, Skeleton, Stack, Text, Timeline, TimelineContent, TimelineItem, TimelineMarker } from "@job-tracker/ui";
import React from "react";

import { useSourceRunActivityEventsQuery } from "@/gql/hooks";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";

type SourceRunActivityEventsDialogProps = {
  runId: string;
  runLabel: string;
  trigger: React.ReactElement;
};

function statusColor(type: string): string {
  if (type.endsWith("_FAILED")) return "text-text-error";
  if (type.endsWith("_COMPLETED") || type.endsWith("_IMPORTED")) return "text-text-success";
  return "text-text-secondary";
}

export function SourceRunActivityEventsDialog({
  runId,
  runLabel,
  trigger,
}: SourceRunActivityEventsDialogProps) {
  const [open, setOpen] = React.useState(false);

  const { data, loading } = useSourceRunActivityEventsQuery({
    variables: { runId },
    skip: !open,
  });

  const events = data?.sourceRunActivityEvents ?? [];

  return (
    <Dialog
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
      title={`Events — ${runLabel}`}
      size="lg"
      childrenClassName="flex flex-col"
    >
      <div className={cn("flex-1 min-h-0 overflow-auto pe-3")}>
        {loading ? (
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
                <TimelineMarker
                  showTopConnector={i > 0}
                  showBottomConnector={i < events.length - 1}
                />
                <TimelineContent>
                  <div className={cn("flex items-start justify-between gap-2")}>
                    <div className={cn("min-w-0")}>
                      <Text size="sm" weight="medium" className={cn(statusColor(event.type))}>
                        {event.summary}
                      </Text>
                      <Text size="xs" color="muted">
                        {event.type}
                        {event.type === "SOURCE_RUN_JOB_IMPORTED" && (event.payload as { duplicate?: boolean } | null)?.duplicate
                          ? " · skipped (duplicate)"
                          : null}
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
