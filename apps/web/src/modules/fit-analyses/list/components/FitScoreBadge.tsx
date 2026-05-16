"use client";

import { Badge } from "@job-tracker/ui";

import { formatFitLabel } from "@/modules/applications/shared/utils/fitFormat";

const intentMap: Record<string, "success" | "error" | "default"> = {
  positive: "success",
  negative: "error",
};

function badgeIntent(classification: string | null | undefined) {
  return intentMap[classification ?? ""] ?? "default";
}

interface FitScoreBadgeProps {
  classification: string | null | undefined;
  scoreRatio: number | null | undefined;
}

export function FitScoreBadge({
  classification,
  scoreRatio,
}: FitScoreBadgeProps) {
  return (
    <Badge intent={badgeIntent(classification)}>
      {formatFitLabel(classification, scoreRatio)}
    </Badge>
  );
}
