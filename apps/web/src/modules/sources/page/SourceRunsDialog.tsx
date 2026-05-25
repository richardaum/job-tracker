"use client";

import { Badge, cn, Dialog, Stack, Text } from "@job-tracker/ui";
import React from "react";

import { SourceRunStatus } from "@/gql/graphql";
import { formatDateTime } from "@/modules/jobs/details/utils/job-details.shared";
import { RunSourceTemplateButton } from "@/modules/sources/page/RunSourceTemplateButton";
import type { SourceListItem } from "@/modules/sources/page/source-template-list.shared";
import { scheduleSummary } from "@/modules/sources/page/source-template-list.shared";

function statusBadgeIntent(
  status: SourceRunStatus,
): React.ComponentProps<typeof Badge>["intent"] {
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

type SourceRunsDialogProps = {
  template: SourceListItem | null;
  sourceProfileId: string;
  onOpenChange: (open: boolean) => void;
  onRunStarted?: (
    templateId: string,
    run: SourceListItem["runs"][number],
  ) => void;
};

export function SourceRunsDialog({
  template,
  sourceProfileId,
  onOpenChange,
  onRunStarted,
}: SourceRunsDialogProps) {
  const open = template !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Source runs"
      description={
        template ? (
          <Text size="sm" color="secondary">
            {scheduleSummary(template)} · Created{" "}
            {formatDateTime(String(template.createdAt))}
          </Text>
        ) : undefined
      }
      footer={
        template ? (
          <Stack direction="row" justify="end">
            <RunSourceTemplateButton
              templateId={template.id}
              sourceProfileId={sourceProfileId}
              label="Run again"
              tooltip="Run again"
              variant="button"
              onRunStarted={onRunStarted}
            />
          </Stack>
        ) : undefined
      }
    >
      {open && template ? (
        template.runs.length === 0 ? (
          <Text size="sm" color="secondary">
            No runs for this source yet.
          </Text>
        ) : (
          <ul className={cn("m-0 list-none space-y-2 p-0")}>
            {template.runs.map((run, index) => (
              <li
                key={run.id}
                className={cn(
                  "border-b border-border-subtle pb-2 last:border-0",
                )}
              >
                <Stack
                  direction="row"
                  gap="sm"
                  align="center"
                  justify="between"
                  className={cn("w-full")}
                >
                  <Stack direction="row" gap="sm" align="center">
                    <Text
                      size="sm"
                      className={cn("tabular-nums text-text-secondary")}
                    >
                      {index + 1}.
                    </Text>
                    <Badge intent={statusBadgeIntent(run.status)}>
                      {run.status.replaceAll("_", " ")}
                    </Badge>
                  </Stack>
                  <Text
                    size="sm"
                    color="secondary"
                    className={cn("whitespace-nowrap")}
                  >
                    {formatDateTime(String(run.startedAt))}
                  </Text>
                </Stack>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </Dialog>
  );
}
