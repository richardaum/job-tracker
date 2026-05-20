"use client";

import { cn, ListItemCard } from "@job-tracker/ui";
import NextLink from "next/link";

import type { FitAnalysesListQuery } from "@/gql/hooks";
import { AsyncMetadataStatus } from "@/gql/hooks";

import { FitScoreBadge } from "./FitScoreBadge";

type FitListItem = FitAnalysesListQuery["fitAnalyses"][number];

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
    <ListItemCard.Title size="sm" asChild>
      <NextLink href={`/fits/${fit.id}`} className={cn("font-semibold")}>
        {parentLabel}
      </NextLink>
    </ListItemCard.Title>
  );

  const actions =
    fit.scoreRatio != null ? (
      <ListItemCard.Actions>
        <FitScoreBadge
          classification={fit.classification}
          scoreRatio={fit.scoreRatio}
        />
      </ListItemCard.Actions>
    ) : undefined;

  const isComplete =
    fit.generationMetadata?.status === AsyncMetadataStatus.Completed;

  const meta = (
    <span className={cn("text-text-muted text-xs")}>
      {isComplete
        ? `${fit.fitCount} fits · ${fit.gapCount} gaps · ${fit.unclearCount} unclear — `
        : ""}
      {formatDate(fit.createdAt)}
    </span>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
