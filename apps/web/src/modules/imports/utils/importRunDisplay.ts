import { ImportRunStatus } from "@/gql/graphql";
import type { ImportRun } from "@/modules/imports/types/importRun";

export function formatImportRunStartedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function importRunStatusBadgeIntent(
  status: ImportRun["status"],
): "default" | "success" | "error" {
  if (status === ImportRunStatus.Completed) return "success";
  if (status === ImportRunStatus.Failed) return "error";
  return "default";
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
