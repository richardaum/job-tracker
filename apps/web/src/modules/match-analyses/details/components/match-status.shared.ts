import { AsyncMetadataStatus } from "@/gql/hooks";

export const MATCH_STATUS_LABEL: Record<string, string> = {
  [AsyncMetadataStatus.Processing]: "Processing",
  [AsyncMetadataStatus.Completed]: "Completed",
  [AsyncMetadataStatus.Failed]: "Failed",
};

const MATCH_STATUS_TOOLTIP: Record<string, string> = {
  [AsyncMetadataStatus.Processing]:
    "Analyzing your resume against this job. Results will appear automatically.",
  [AsyncMetadataStatus.Completed]:
    "Match analysis is ready. Open to see fits, gaps, and unclear areas.",
  [AsyncMetadataStatus.Failed]: "Match analysis failed. Open the tab to retry.",
};

export const MATCH_STATUS_DOT_CLASS: Record<string, string> = {
  [AsyncMetadataStatus.Processing]: "bg-text-warning",
  [AsyncMetadataStatus.Completed]: "bg-text-success",
  [AsyncMetadataStatus.Failed]: "bg-text-error",
};

export const MATCH_STATUS_PROCESSING_PULSE_CLASS = "animate-match-status-pulse";

export function getMatchStatusLabel(status: string | AsyncMetadataStatus): string {
  return MATCH_STATUS_LABEL[status] ?? status;
}

export function getMatchStatusTooltipContent(
  status: string | AsyncMetadataStatus,
  error?: string | null,
): string {
  const description = MATCH_STATUS_TOOLTIP[status] ?? getMatchStatusLabel(status);

  if (status === AsyncMetadataStatus.Failed && error) {
    return `${description} ${error}`;
  }

  return description;
}
