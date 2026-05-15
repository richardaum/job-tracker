"use client";

import { cn, FieldWithLabelAction, Text } from "@job-tracker/ui";
import { ArrowsClockwiseIcon, SparkleIcon } from "@phosphor-icons/react";

import { SummaryStatus } from "@/gql/hooks";
import { TipTapContent } from "@/modules/applications/shared/components/TipTapContent";

interface SummaryFieldProps {
  summary: string | null | undefined;
  summaryError: string | null | undefined;
  summaryGeneratedAt: string | null | undefined;
  summaryStatus: SummaryStatus;
  onGenerateSummary: () => void;
}

export function SummaryField({
  summary,
  summaryError,
  summaryGeneratedAt,
  summaryStatus,
  onGenerateSummary,
}: SummaryFieldProps) {
  const isProcessing = summaryStatus === SummaryStatus.Processing;
  const isFailed = summaryStatus === SummaryStatus.Failed;

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
            {summaryError ? (
              <Text size="xs" color="muted">
                {summaryError}
              </Text>
            ) : null}
          </div>
        ) : summary ? (
          <div className={cn("flex flex-col gap-1")}>
            <TipTapContent content={summary} />
            {summaryGeneratedAt ? (
              <Text size="xs" color="muted">
                Generated at {new Date(summaryGeneratedAt).toLocaleString()}
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
