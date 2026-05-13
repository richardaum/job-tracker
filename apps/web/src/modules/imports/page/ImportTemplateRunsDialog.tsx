"use client";

import { Badge, cn, Dialog, Stack, Text } from "@job-tracker/ui";
import React from "react";

import { ImportRunStatus } from "@/gql/graphql";
import { formatDateTime } from "@/modules/applications/details/utils/application-details.shared";
import type { ImportTemplateListItem } from "@/modules/imports/page/import-template-list.shared";
import { scheduleSummary } from "@/modules/imports/page/import-template-list.shared";

function statusBadgeIntent(
  status: ImportRunStatus,
): React.ComponentProps<typeof Badge>["intent"] {
  switch (status) {
    case ImportRunStatus.Completed:
      return "success";
    case ImportRunStatus.Failed:
      return "error";
    case ImportRunStatus.Running:
    case ImportRunStatus.InProgress:
      return "info";
  }
}

type ImportTemplateRunsDialogProps = {
  template: ImportTemplateListItem | null;
  onOpenChange: (open: boolean) => void;
};

export function ImportTemplateRunsDialog({
  template,
  onOpenChange,
}: ImportTemplateRunsDialogProps) {
  const open = template !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title="Import runs"
      description={
        template ? (
          <Text size="sm" color="secondary">
            {scheduleSummary(template)} · Created{" "}
            {formatDateTime(String(template.createdAt))}
          </Text>
        ) : undefined
      }
    >
      {open && template ? (
        template.runs.length === 0 ? (
          <Text size="sm" color="secondary">
            No runs for this template yet.
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
