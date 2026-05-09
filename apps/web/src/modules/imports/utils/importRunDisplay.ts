import { tryRun } from "@job-tracker/try-run";

import { ImportRunStatus } from "@/gql/graphql";
import type { ImportRun } from "@/modules/imports/types/importRun";

export function formatImportRunStartedAt(iso: string): string {
  const [err, formatted] = tryRun(() =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso)),
  );
  if (!err) {
    return formatted;
  }
  return iso;
}

export function importRunStatusBadgeIntent(
  status: ImportRun["status"],
): "default" | "success" | "error" {
  if (status === ImportRunStatus.Completed) return "success";
  if (status === ImportRunStatus.Failed) return "error";
  return "default";
}

/** Text blob used to match the import runs search box. */
export function importRunSearchHaystack(run: ImportRun): string {
  return [
    run.importerName,
    run.importerSource,
    run.importerId,
    run.status,
    run.entryUrl ?? "",
  ].join(" ");
}

export function formatImportRunStatusLabel(status: ImportRunStatus): string {
  switch (status) {
    case ImportRunStatus.Completed:
      return "completed";
    case ImportRunStatus.Failed:
      return "failed";
    case ImportRunStatus.InProgress:
      return "in progress";
    default:
      return "running";
  }
}
