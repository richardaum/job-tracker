"use client";

import { Badge, cn, Stack, Text, Tooltip } from "@job-tracker/ui";
import NextLink from "next/link";

import { FitClassification as FitClassificationValue } from "@/gql/hooks";
import {
  formatMatchClassification,
  formatMatchLabel,
} from "@/modules/jobs/shared/utils/matchFormat";

type BadgeVariant = "compact" | "badge" | "detailed";

interface MatchClassificationProps {
  classification: string | null;
  scoreRatio: number | null;
  matchCount: number;
  gapCount: number;
  unclearCount: number;
  variant?: BadgeVariant;
  /** Kept for call-site clarity; linking uses `jobId` into the Match tab. */
  matchId?: string;
  /** Opens the Match tab (`/jobs/:id/match`) when `variant="badge"`. */
  jobId?: string;
}

const colorMap = {
  positive: {
    textColor: "success" as const,
    badgeIntent: "success" as const,
    badgeClass: "border-green-500 bg-green-50 text-green-800",
  },
  negative: {
    textColor: "warning" as const,
    badgeIntent: "warning" as const,
    badgeClass: "border-yellow-500 bg-yellow-50 text-yellow-800",
  },
  inconclusive: {
    textColor: "secondary" as const,
    badgeIntent: "info" as const,
    badgeClass: "border-border-default bg-field text-text-secondary",
  },
} as const;

function getStyle(classification: string | null) {
  if (classification === FitClassificationValue.Positive)
    return colorMap.positive;
  if (classification === FitClassificationValue.Negative)
    return colorMap.negative;
  return colorMap.inconclusive;
}

function DetailTooltip({
  classification,
  matchCount,
  gapCount,
  unclearCount,
  children,
}: {
  classification: string | null;
  matchCount: number;
  gapCount: number;
  unclearCount: number;
  children: React.ReactElement;
}) {
  const label = formatMatchClassification(classification);

  return (
    <Tooltip
      content={
        <Stack gap="xs" className={cn("py-0.5 text-text-inverted")}>
          <div className={cn("text-xs font-semibold")}>{label}</div>
          <div className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5")}>
            <span className={cn("text-xs text-text-inverted opacity-70")}>
              Matches
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums text-text-inverted",
              )}
            >
              {matchCount}
            </span>
            <span className={cn("text-xs text-text-inverted opacity-70")}>
              Gaps
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums text-text-inverted",
              )}
            >
              {gapCount}
            </span>
            <span className={cn("text-xs text-text-inverted opacity-70")}>
              Unclear
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums text-text-inverted",
              )}
            >
              {unclearCount}
            </span>
          </div>
        </Stack>
      }
      side="bottom"
    >
      {children}
    </Tooltip>
  );
}

function CompactBadge({
  classification,
  scoreRatio,
  matchCount,
  gapCount,
  unclearCount,
}: MatchClassificationProps) {
  const label = formatMatchClassification(classification);
  const style = getStyle(classification);

  const content = (
    <Text
      size="sm"
      weight="medium"
      color={style.textColor}
      className={cn("cursor-default leading-none")}
    >
      {label}
      {scoreRatio != null && (
        <span className={cn("ml-1 font-normal opacity-80")}>
          ({Math.round(scoreRatio)}%)
        </span>
      )}
    </Text>
  );

  return (
    <div className={cn("inline-flex h-6 items-center")}>
      <DetailTooltip
        classification={classification}
        matchCount={matchCount}
        gapCount={gapCount}
        unclearCount={unclearCount}
      >
        {content}
      </DetailTooltip>
    </div>
  );
}

function BadgeBadge({
  classification,
  scoreRatio,
  matchCount,
  gapCount,
  unclearCount,
  jobId,
}: MatchClassificationProps) {
  const style = getStyle(classification);

  const badge = (
    <Badge
      intent={style.badgeIntent}
      className={cn(
        "cursor-pointer font-medium transition-all hover:brightness-95",
      )}
    >
      {formatMatchLabel(classification, scoreRatio)}
    </Badge>
  );

  return (
    <DetailTooltip
      classification={classification}
      matchCount={matchCount}
      gapCount={gapCount}
      unclearCount={unclearCount}
    >
      {jobId !== undefined && jobId !== "" ? (
        <NextLink
          href={`/jobs/${jobId}/match`}
          className={cn("no-underline focus-visible:outline-none")}
        >
          {badge}
        </NextLink>
      ) : (
        badge
      )}
    </DetailTooltip>
  );
}

function DetailedBadge(props: MatchClassificationProps) {
  const { classification, scoreRatio, matchCount, gapCount, unclearCount } =
    props;
  const label = formatMatchClassification(classification);
  const style = getStyle(classification);

  return (
    <div className={cn("flex flex-wrap items-center gap-2")}>
      <div
        className={cn("rounded-lg border px-3 py-1.5 w-fit", style.badgeClass)}
      >
        <Text size="sm" weight="semibold" className={cn("whitespace-nowrap")}>
          {label}
        </Text>
      </div>
      {scoreRatio !== null && (
        <div
          className={cn(
            "rounded-lg border border-border-subtle bg-surface px-3 py-1.5 w-fit",
          )}
        >
          <Text size="sm" color="secondary" className={cn("whitespace-nowrap")}>
            Score:{" "}
            <span className={cn("font-bold text-text-primary")}>
              {Math.round(scoreRatio)}%
            </span>
          </Text>
        </div>
      )}
      <div
        className={cn(
          "rounded-lg border border-border-subtle bg-surface px-3 py-1.5 w-fit",
        )}
      >
        <Text size="sm" color="secondary" className={cn("whitespace-nowrap")}>
          <span className={cn("font-medium text-text-primary")}>
            {matchCount}
          </span>{" "}
          match{matchCount !== 1 ? "es" : ""} ·{" "}
          <span className={cn("font-medium text-text-primary")}>
            {gapCount}
          </span>{" "}
          gap{gapCount !== 1 ? "s" : ""} ·{" "}
          <span className={cn("font-medium text-text-primary")}>
            {unclearCount}
          </span>{" "}
          unclear
        </Text>
      </div>
    </div>
  );
}

export function MatchClassification(props: MatchClassificationProps) {
  const variant = props.variant ?? "detailed";

  if (!props.classification) return null;

  switch (variant) {
    case "compact":
      return <CompactBadge {...props} />;
    case "badge":
      return <BadgeBadge {...props} />;
    case "detailed":
      return <DetailedBadge {...props} />;
  }
}
