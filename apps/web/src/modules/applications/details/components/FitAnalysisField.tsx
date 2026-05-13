"use client";

import { cn, FieldWithLabelAction, Text } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";

import { FitAnalysisStatus } from "@/gql/hooks";
import type { ApplicationDetailsValues } from "@/modules/applications/details/utils/application-details.shared";
import {
  formatFitClassification,
  formatFitLabel,
} from "@/modules/applications/shared/utils/fitFormat";

interface FitAnalysisFieldProps {
  fit: ApplicationDetailsValues["fit"];
}

export function FitAnalysisField({ fit }: FitAnalysisFieldProps) {
  const fitColor =
    fit?.status === FitAnalysisStatus.Completed
      ? fit.classification === "positive"
        ? "success"
        : fit.classification === "negative"
          ? "error"
          : "primary"
      : "primary";

  const tooltipContent = fit?.status === FitAnalysisStatus.Completed && (
    <div className={cn("space-y-1")}>
      <div className={cn("text-xs font-medium text-text-inverted")}>
        {formatFitClassification(fit.classification)}
      </div>
      <div className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5")}>
        <span className={cn("text-xs text-text-inverted opacity-70")}>
          Fits
        </span>
        <span
          className={cn("text-xs font-medium tabular-nums text-text-inverted")}
        >
          {fit.fitCount}
        </span>
        <span className={cn("text-xs text-text-inverted opacity-70")}>
          Gaps
        </span>
        <span
          className={cn("text-xs font-medium tabular-nums text-text-inverted")}
        >
          {fit.gapCount}
        </span>
        <span className={cn("text-xs text-text-inverted opacity-70")}>
          Unclear
        </span>
        <span
          className={cn("text-xs font-medium tabular-nums text-text-inverted")}
        >
          {fit.unclearCount}
        </span>
      </div>
    </div>
  );

  return (
    <div className={cn("max-w-full")}>
      <FieldWithLabelAction
        label="Fit analysis"
        content={
          !fit ? (
            <Text size="sm" color="secondary">
              Not analyzed
            </Text>
          ) : fit.status === FitAnalysisStatus.Processing ? (
            <Text size="sm" color="secondary">
              Analyzing…
            </Text>
          ) : fit.status === FitAnalysisStatus.Failed ? (
            <FieldWithLabelAction.Tooltip
              content={fit.error ?? "An error occurred during analysis."}
            >
              <Text size="sm" color="error">
                Failed
              </Text>
            </FieldWithLabelAction.Tooltip>
          ) : (
            <Text size="sm" color={fitColor}>
              {formatFitLabel(fit.classification, fit.scoreRatio)}
            </Text>
          )
        }
        actions={
          fit?.status === FitAnalysisStatus.Completed ? (
            <FieldWithLabelAction.Tooltip content={tooltipContent}>
              <InfoIcon
                size={14}
                weight="regular"
                className={cn("cursor-help text-text-muted")}
              />
            </FieldWithLabelAction.Tooltip>
          ) : null
        }
      />
    </div>
  );
}
