import { AsyncMetadataStatus } from "@/gql/hooks";

export type JobFillButtonState = "default" | "loading";

export function deriveJobFillButtonState(
  fillStatus: AsyncMetadataStatus | null | undefined,
  fillMutationLoading: boolean,
): JobFillButtonState {
  if (fillMutationLoading) return "loading";
  if (fillStatus === AsyncMetadataStatus.Processing) return "loading";
  return "default";
}
