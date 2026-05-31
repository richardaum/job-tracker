"use client";

import { cn, FieldWithLabelAction, Text } from "@job-tracker/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { AsyncMetadataStatus, FitClassification } from "@/gql/hooks";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import {
  formatMatchClassification,
  formatMatchLabel,
} from "@/modules/jobs/shared/utils/matchFormat";

interface MatchAnalysisFieldProps {
  jobId: string;
  match: JobDetailsValues["match"];
}

export function MatchAnalysisField({ jobId, match }: MatchAnalysisFieldProps) {
  const router = useRouter();
  const matchColor =
    match?.generationMetadata?.status === AsyncMetadataStatus.Completed
      ? match.classification === FitClassification.Positive
        ? "success"
        : match.classification === FitClassification.Negative
          ? "error"
          : "primary"
      : "primary";

  const tooltipContent = match?.generationMetadata?.status === AsyncMetadataStatus.Completed && (
    <div className={cn("space-y-1")}>
      <div className={cn("text-xs font-medium text-text-inverted")}>
        {formatMatchClassification(match.classification)}
      </div>
      <div className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5")}>
        <span className={cn("text-xs text-text-inverted opacity-70")}>Matches</span>
        <span className={cn("text-xs font-medium tabular-nums text-text-inverted")}>
          {match.matchCount}
        </span>
        <span className={cn("text-xs text-text-inverted opacity-70")}>Gaps</span>
        <span className={cn("text-xs font-medium tabular-nums text-text-inverted")}>
          {match.gapCount}
        </span>
        <span className={cn("text-xs text-text-inverted opacity-70")}>Unclear</span>
        <span className={cn("text-xs font-medium tabular-nums text-text-inverted")}>
          {match.unclearCount}
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-full")}>
      <FieldWithLabelAction
        label="Match analysis"
        actions={
          <FieldWithLabelAction.IconActionButton
            label="View full match analysis"
            icon={<ArrowSquareOutIcon size={14} weight="regular" />}
            onClick={() => match?.id && router.push(`/jobs/${jobId}/match`)}
          />
        }
        content={
          !match ? (
            <Text size="sm" color="secondary">
              Not analyzed
            </Text>
          ) : match.generationMetadata?.status === AsyncMetadataStatus.Processing ? (
            <Text size="sm" color="secondary">
              Analyzing…
            </Text>
          ) : match.generationMetadata?.status === AsyncMetadataStatus.Failed ? (
            <FieldWithLabelAction.Tooltip
              content={match.generationMetadata.error ?? "An error occurred during analysis."}
            >
              <Text size="sm" color="error">
                Failed
              </Text>
            </FieldWithLabelAction.Tooltip>
          ) : (
            <FieldWithLabelAction.Tooltip content={tooltipContent}>
              <Text size="sm" color={matchColor}>
                {formatMatchLabel(match.classification, match.scoreRatio)}
              </Text>
            </FieldWithLabelAction.Tooltip>
          )
        }
      />
    </div>
  );
}
