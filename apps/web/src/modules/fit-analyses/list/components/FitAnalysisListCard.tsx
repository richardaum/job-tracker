"use client";

import { cn, ListItemCard } from "@job-tracker/ui";
import NextLink from "next/link";

import type { FitAnalysesListQuery } from "@/gql/hooks";
import { FitAnalysisStatus } from "@/gql/hooks";
import { formatFitLabel } from "@/modules/applications/shared/utils/fitFormat";

export type FitListItem = FitAnalysesListQuery["fitAnalyses"][number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

interface FitAnalysisListCardProps {
  fit: FitListItem;
}

export function FitAnalysisListCard({ fit }: FitAnalysisListCardProps) {
  const parentLabel = fit.application
    ? `${fit.application.title} @ ${fit.application.company.name}`
    : fit.draftApplication
      ? fit.draftApplication.title
      : "Unknown";

  const title = (
    <ListItemCard.Title asChild size="sm" className={cn("font-semibold")}>
      <NextLink href={`/fits/${fit.id}`}>
        <span className={cn("inline-flex items-center gap-2")}>
          <span>{parentLabel}</span>
          {fit.scoreRatio != null && (
            <span
              className={cn(
                "text-xs font-medium",
                fit.classification === "positive"
                  ? "text-text-success"
                  : fit.classification === "negative"
                    ? "text-text-error"
                    : "text-text-primary",
              )}
            >
              {formatFitLabel(fit.classification, fit.scoreRatio)}
            </span>
          )}
        </span>
      </NextLink>
    </ListItemCard.Title>
  );

  const isComplete = fit.status === FitAnalysisStatus.Completed;

  const meta = (
    <span className={cn("text-text-muted text-xs")}>
      {isComplete
        ? `${fit.fitCount} fits · ${fit.gapCount} gaps · ${fit.unclearCount} unclear — `
        : ""}
      {formatDate(fit.createdAt)}
    </span>
  );

  return <ListItemCard title={title} meta={meta} />;
}
