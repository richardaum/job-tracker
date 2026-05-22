"use client";

import { cn, ListItemCard } from "@job-tracker/ui";
import NextLink from "next/link";

import type { MatchAnalysesListQuery } from "@/gql/hooks";
import { AsyncMetadataStatus } from "@/gql/hooks";

import { MatchScoreBadge } from "./MatchScoreBadge";

type MatchListItem = MatchAnalysesListQuery["matchAnalyses"][number];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

interface MatchAnalysisListCardProps {
  matchAnalysis: MatchListItem;
}

export function MatchAnalysisListCard({
  matchAnalysis,
}: MatchAnalysisListCardProps) {
  const parentLabel = matchAnalysis.job
    ? `${matchAnalysis.job.title} @ ${matchAnalysis.job.company.name}`
    : matchAnalysis.draftJob
      ? matchAnalysis.draftJob.title
      : "Unknown";

  const title = (
    <ListItemCard.Title size="sm" asChild>
      <NextLink
        href={`/matches/${matchAnalysis.id}`}
        className={cn("font-semibold")}
      >
        {parentLabel}
      </NextLink>
    </ListItemCard.Title>
  );

  const actions =
    matchAnalysis.scoreRatio != null ? (
      <ListItemCard.Actions>
        <MatchScoreBadge
          classification={matchAnalysis.classification}
          scoreRatio={matchAnalysis.scoreRatio}
        />
      </ListItemCard.Actions>
    ) : undefined;

  const isComplete =
    matchAnalysis.generationMetadata?.status === AsyncMetadataStatus.Completed;

  const meta = (
    <span className={cn("text-text-muted text-xs")}>
      {isComplete
        ? `${matchAnalysis.matchCount} matches · ${matchAnalysis.gapCount} gaps · ${matchAnalysis.unclearCount} unclear — `
        : ""}
      {formatDate(matchAnalysis.createdAt)}
    </span>
  );

  return <ListItemCard title={title} actions={actions} meta={meta} />;
}
