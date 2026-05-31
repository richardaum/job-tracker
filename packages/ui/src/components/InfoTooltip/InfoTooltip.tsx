import { InfoIcon } from "@phosphor-icons/react";
import { cn } from "@ui/lib/cn";
import type { ReactNode } from "react";

import { Tooltip } from "@ui/components/Tooltip/Tooltip";

export interface InfoTooltipProps {
  content: ReactNode;
  size?: number;
  className?: string;
}

export function InfoTooltip({
  content,
  size = 14,
  className,
}: InfoTooltipProps) {
  return (
    <Tooltip content={content} side="top" align="center">
      <span
        className={cn(
          "inline-flex cursor-help text-text-muted hover:text-text-secondary",
          className,
        )}
        tabIndex={0}
        role="tooltip"
      >
        <InfoIcon size={size} weight="regular" />
      </span>
    </Tooltip>
  );
}
