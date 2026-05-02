"use client";

import { Badge, cn, Text } from "@job-tracker/ui";

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
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-border-brand bg-bg-brand-subtle"
          : "border-border-subtle bg-bg-surface hover:bg-bg-surface-hover",
      )}
    >
      <div className={cn("flex items-start justify-between gap-2")}>
        <Text size="sm" weight="semibold" className={cn("min-w-0 truncate")}>
          {run.importerName}
        </Text>
        <Badge intent={importRunStatusBadgeIntent(run.status)}>
          {formatImportRunStatusLabel(run.status)}
        </Badge>
      </div>
      <Text size="xs" color="muted" className={cn("mt-1")}>
        {formatImportRunStartedAt(run.startedAt)}
      </Text>
    </button>
  );
}
