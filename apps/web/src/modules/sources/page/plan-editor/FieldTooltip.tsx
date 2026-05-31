"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import { InfoIcon } from "@phosphor-icons/react";

type FieldTooltipProps = { content: string };
export function FieldTooltip({ content }: FieldTooltipProps) {
  return (
    <Tooltip content={content} side="top" align="center">
      <span
        className={cn(
          "inline-flex cursor-help text-text-muted hover:text-text-secondary",
        )}
      >
        <InfoIcon size={14} weight="regular" />
      </span>
    </Tooltip>
  );
}
