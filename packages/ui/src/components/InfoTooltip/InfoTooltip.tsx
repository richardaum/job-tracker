"use client";

import { InfoIcon } from "@phosphor-icons/react";
import { cn } from "@ui/lib/cn";
import type { ReactNode } from "react";

import { Tooltip } from "@ui/components/Tooltip/Tooltip";

export interface InfoTooltipProps {
  content: ReactNode;
  size?: number;
  className?: string;
  /** Constrains content width and wraps text, for longer copy that would otherwise render as one long line. */
  maxWidth?: number | string;
}

export function InfoTooltip({ content, size = 14, className, maxWidth }: InfoTooltipProps) {
  return (
    <Tooltip content={content} side="top" align="center" maxWidth={maxWidth}>
      <span
        className={cn("inline-flex cursor-help text-text-muted hover:text-text-secondary", className)}
        tabIndex={0}
        role="tooltip"
      >
        <InfoIcon size={size} weight="regular" />
      </span>
    </Tooltip>
  );
}
