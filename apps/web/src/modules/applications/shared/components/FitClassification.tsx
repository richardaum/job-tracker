"use client";

import { Badge, cn, Stack, Text, Tooltip } from "@job-tracker/ui";
import NextLink from "next/link";

import { FitClassification as FitClassificationValue } from "@/gql/hooks";
import {
  formatFitClassification,
  formatFitLabel,
} from "@/modules/applications/shared/utils/fitFormat";

type BadgeVariant = "compact" | "badge" | "detailed";

interface FitClassificationProps {
  classification: string | null;
  scoreRatio: number | null;
  fitCount: number;
  gapCount: number;
  unclearCount: number;
  variant?: BadgeVariant;
  fitId?: string;
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
  fitCount,
  gapCount,
  unclearCount,
  children,
}: {
  classification: string | null;
  fitCount: number;
  gapCount: number;
  unclearCount: number;
  children: React.ReactElement;
}) {
  const label = formatFitClassification(classification);

  return (
    <Tooltip
      content={
        <Stack gap="xs" className={cn("py-0.5 text-text-inverted")}>
          <div className={cn("text-xs font-semibold")}>{label}</div>
          <div className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-0.5")}>
            <span className={cn("text-xs text-text-inverted opacity-70")}>
              Fits
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums text-text-inverted",
              )}
            >
              {fitCount}
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
  fitCount,
  gapCount,
  unclearCount,
}: FitClassificationProps) {
  const label = formatFitClassification(classification);
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
        fitCount={fitCount}
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
  fitCount,
  gapCount,
  unclearCount,
  fitId,
}: FitClassificationProps) {
  const style = getStyle(classification);

  const badge = (
    <Badge
      intent={style.badgeIntent}
      className={cn(
        "cursor-pointer font-medium transition-all hover:brightness-95",
      )}
    >
      {formatFitLabel(classification, scoreRatio)}
    </Badge>
  );

  return (
    <DetailTooltip
      classification={classification}
      fitCount={fitCount}
      gapCount={gapCount}
      unclearCount={unclearCount}
    >
      {fitId ? (
        <NextLink
          href={`/fits/${fitId}`}
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

function DetailedBadge(props: FitClassificationProps) {
  const { classification, scoreRatio, fitCount, gapCount, unclearCount } =
    props;
  const label = formatFitClassification(classification);
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
            {fitCount}
          </span>{" "}
          fit{fitCount !== 1 ? "s" : ""} ·{" "}
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

export function FitClassification(props: FitClassificationProps) {
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
