"use client";

import { Badge, cn } from "@job-tracker/ui";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import React from "react";

import { MatchVerdict } from "@/gql/hooks";

export function VerdictBadge({ verdict }: { verdict: string }) {
  const isFit = verdict === MatchVerdict.Fit;
  const isGap = verdict === MatchVerdict.Gap;

  return (
    <>
      {isFit && (
        <CheckCircleIcon
          size={16}
          weight="fill"
          className={cn("text-text-success shrink-0")}
        />
      )}
      {isGap && (
        <XCircleIcon
          size={16}
          weight="fill"
          className={cn("text-text-error shrink-0")}
        />
      )}
      {!isFit && !isGap && (
        <MinusCircleIcon
          size={16}
          weight="fill"
          className={cn("text-text-warning shrink-0")}
        />
      )}
      <Badge intent="default" className={cn("border-0 bg-neutral-100")}>
        <span
          className={cn(
            isFit && "text-text-success",
            isGap && "text-text-error",
            !isFit && !isGap && "text-text-warning",
          )}
        >
          {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
        </span>
      </Badge>
    </>
  );
}
