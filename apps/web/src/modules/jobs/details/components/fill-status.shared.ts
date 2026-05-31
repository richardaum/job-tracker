import { AsyncMetadataStatus } from "@/gql/hooks";

const FILL_STATUS_TOOLTIP: Record<string, string> = {
  [AsyncMetadataStatus.Processing]:
    "Filling job fields automatically. Updates will appear when complete.",
  [AsyncMetadataStatus.Completed]: "Job fields were filled automatically. Open Overview to review.",
  [AsyncMetadataStatus.Failed]:
    "Automatic fill failed. Retry from Actions or review fields on Overview.",
};

export function getFillStatusTooltipContent(
  status: string | AsyncMetadataStatus,
  error?: string | null,
): string {
  const description =
    FILL_STATUS_TOOLTIP[status] ??
    (status === AsyncMetadataStatus.Processing
      ? "Processing"
      : status === AsyncMetadataStatus.Completed
        ? "Completed"
        : status === AsyncMetadataStatus.Failed
          ? "Failed"
          : status);

  if (status === AsyncMetadataStatus.Failed && error) {
    return `${description} ${error}`;
  }

  return description;
}
