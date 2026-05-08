"use client";

import { Badge, cn, ListItemCard, Text } from "@job-tracker/ui";

import type { ImportRun } from "@/modules/imports/types/importRun";
import {
  formatImportRunStartedAt,
  formatImportRunStatusLabel,
  importRunStatusBadgeIntent,
} from "@/modules/imports/utils/importRunDisplay";

export function ImportRunCard({
  run,
  selected,
  onSelect,
}: {
  run: ImportRun;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full cursor-pointer border-0 bg-transparent p-0 text-left",
        "rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2",
      )}
    >
      <ListItemCard
        className={cn(
          "transition-colors",
          selected
            ? "border-border-brand bg-bg-brand-subtle"
            : "hover:bg-bg-surface-hover",
        )}
        title={
          <Text size="sm" weight="semibold" className={cn("min-w-0 truncate")}>
            {run.importerName}
          </Text>
        }
        actions={
          <Badge intent={importRunStatusBadgeIntent(run.status)}>
            {formatImportRunStatusLabel(run.status)}
          </Badge>
        }
        meta={
          <Text size="xs" color="muted">
            {formatImportRunStartedAt(run.startedAt)}
          </Text>
        }
      />
    </button>
  );
}
