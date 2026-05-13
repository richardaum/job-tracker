"use client";

import { Badge, cn, Stack, Tooltip } from "@job-tracker/ui";
import NextLink from "next/link";

import type { ApplicationCardApplication } from "@/modules/applications/list/hooks/useApplicationCardViewModel";
import {
  formatFitClassification,
  formatFitLabel,
} from "@/modules/applications/shared/utils/fitFormat";

export function FitBadge({
  application,
}: {
  application: ApplicationCardApplication;
}) {
  const fit = application.fit;
  if (!fit || fit.scoreRatio == null) return null;

  const intent =
    fit.classification === "positive"
      ? "success"
      : fit.classification === "negative"
        ? "error"
        : "info";

  const tooltipContent = (
    <Stack gap="xs" className={cn("py-0.5 text-text-inverted")}>
      <div className={cn("text-xs font-semibold")}>
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
    </Stack>
  );

  return (
    <Tooltip content={tooltipContent} side="bottom">
      <NextLink
        href={`/fit/${fit.id}`}
        className={cn("no-underline focus-visible:outline-none")}
      >
        <Badge
          intent={intent}
          className={cn(
            "cursor-pointer font-medium transition-all hover:brightness-95",
          )}
        >
          {formatFitLabel(fit.classification, fit.scoreRatio)}
        </Badge>
      </NextLink>
    </Tooltip>
  );
}
