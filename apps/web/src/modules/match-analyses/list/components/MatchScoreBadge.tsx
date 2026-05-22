"use client";

import { Badge } from "@job-tracker/ui";

import { formatMatchLabel } from "@/modules/jobs/shared/utils/matchFormat";

const intentMap: Record<string, "success" | "error" | "default"> = {
  positive: "success",
  negative: "error",
};

function badgeIntent(classification: string | null | undefined) {
  return intentMap[classification ?? ""] ?? "default";
}

interface MatchScoreBadgeProps {
  classification: string | null | undefined;
  scoreRatio: number | null | undefined;
}

export function MatchScoreBadge({
  classification,
  scoreRatio,
}: MatchScoreBadgeProps) {
  return (
    <Badge intent={badgeIntent(classification)}>
      {formatMatchLabel(classification, scoreRatio)}
    </Badge>
  );
}
