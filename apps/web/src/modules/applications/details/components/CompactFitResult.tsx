"use client";

import { cn, Text, Tooltip } from "@job-tracker/ui";
import React from "react";

interface CompactFitResultProps {
  classification: string | null;
  scoreRatio: number | null;
  fitCount: number;
  gapCount: number;
  unclearCount: number;
  className?: string;
}

export function CompactFitResult({
  classification,
  scoreRatio,
  fitCount,
  gapCount,
  unclearCount,
  className,
}: CompactFitResultProps) {
  const isPositive = classification === "positive";
  const isNegative = classification === "negative";

  const label = isPositive
    ? "Strong fit"
    : isNegative
      ? "Weak fit"
      : "Inconclusive";

  const color = isPositive ? "success" : isNegative ? "error" : "secondary";

  const tooltipContent = (
    <div className={cn("flex flex-col gap-0.5 text-xs")}>
      <div className={cn("font-semibold mb-1")}>Analysis details:</div>
      <div className={cn("flex justify-between gap-4")}>
        <span>Matches</span>
        <span className={cn("font-mono")}>{fitCount}</span>
      </div>
      <div className={cn("flex justify-between gap-4")}>
        <span>Gaps</span>
        <span className={cn("font-mono")}>{gapCount}</span>
      </div>
      <div className={cn("flex justify-between gap-4")}>
        <span>Unclear</span>
        <span className={cn("font-mono")}>{unclearCount}</span>
      </div>
    </div>
  );

  return (
    <div className={cn("inline-flex h-6 items-center", className)}>
      <Tooltip content={tooltipContent} side="bottom" align="start">
        <Text
          size="sm"
          weight="medium"
          color={color}
          className={cn("cursor-default leading-none")}
        >
          {label}
          {scoreRatio != null && (
            <span className={cn("ml-1 font-normal opacity-80")}>
              ({Math.round(scoreRatio)}%)
            </span>
          )}
        </Text>
      </Tooltip>
    </div>
  );
}
