"use client";

import { cn, Text } from "@job-tracker/ui";

interface ScoreBadgeProps {
  classification: string | null;
  scoreRatio: number | null;
  fitCount: number;
  gapCount: number;
  unclearCount: number;
}

export function ScoreBadge({
  classification,
  scoreRatio,
  fitCount,
  gapCount,
  unclearCount,
}: ScoreBadgeProps) {
  const isPositive = classification === "positive";
  const isNegative = classification === "negative";
  const label =
    classification === "positive"
      ? "Strong fit"
      : classification === "negative"
        ? "Weak fit"
        : "Inconclusive";

  return (
    <div className={cn("flex flex-wrap items-center gap-2")}>
      {/* Classification Card */}
      <div
        className={cn(
          "rounded-lg border px-3 py-1.5 w-fit",
          isPositive && "border-green-500 bg-green-50 text-green-800",
          isNegative && "border-red-500 bg-red-50 text-red-800",
          !isPositive &&
            !isNegative &&
            "border-border-default bg-field text-text-secondary",
        )}
      >
        <Text size="sm" weight="semibold" className={cn("whitespace-nowrap")}>
          {label}
        </Text>
      </div>

      {/* Score Card */}
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

      {/* Stats Card */}
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
