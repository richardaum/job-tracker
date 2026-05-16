"use client";

import { cn, FieldWithLabelAction, Text } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, SparkleIcon } from "@phosphor-icons/react";

import { AsyncMetadataStatus } from "@/gql/hooks";
import { TipTapContent } from "@/modules/applications/shared/components/TipTapContent";

interface SummaryFieldProps {
  summary: string | null | undefined;
  summaryMetadata:
    | {
        status: AsyncMetadataStatus;
        error?: string | null;
        timestamp?: string | null;
      }
    | null
    | undefined;
  onGenerateSummary: () => void;
}

export function SummaryField({
  summary,
  summaryMetadata,
  onGenerateSummary,
}: SummaryFieldProps) {
  const isProcessing =
    summaryMetadata?.status === AsyncMetadataStatus.Processing;
  const isFailed = summaryMetadata?.status === AsyncMetadataStatus.Failed;

  return (
    <div className={cn("w-full")}>
      <div className={cn("group flex min-h-7 items-center gap-1.5")}>
        <SparkleIcon size={14} weight="regular" />
        <Text size="xs" color="muted">
          Summary
        </Text>
        <FieldWithLabelAction.IconActionButton
          label="Regenerate summary"
          icon={
            <ArrowsClockwiseIcon
              size={14}
              weight="regular"
              className={cn(isProcessing && "animate-spin")}
            />
          }
          disabled={isProcessing}
          onClick={onGenerateSummary}
        />
      </div>
      <div className={cn("mt-1 min-w-0")}>
        {isProcessing ? (
          <Text size="sm" color="secondary">
            Generating summary...
          </Text>
        ) : isFailed ? (
          <div className={cn("flex flex-col gap-1")}>
            <Text size="sm" color="error">
              Failed to generate summary.
            </Text>
            {summaryMetadata?.error ? (
              <Text size="xs" color="muted">
                {summaryMetadata.error}
              </Text>
            ) : null}
          </div>
        ) : summary ? (
          <div className={cn("flex flex-col gap-1")}>
            <TipTapContent content={summary} />
            {summaryMetadata?.timestamp ? (
              <Text size="xs" color="muted">
                Generated at{" "}
                {new Date(summaryMetadata.timestamp).toLocaleString()}
              </Text>
            ) : null}
          </div>
        ) : (
          <Text size="sm" color="secondary">
            No summary yet.
          </Text>
        )}
      </div>
    </div>
  );
}
