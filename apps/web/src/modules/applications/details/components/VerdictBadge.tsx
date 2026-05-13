"use client";

import { Badge, cn } from "@job-tracker/ui";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import React from "react";

export function VerdictBadge({ verdict }: { verdict: string }) {
  const isFit = verdict === "fit";
  const isGap = verdict === "gap";

  return (
    <>
      {isFit && (
        <CheckCircleIcon
          size={16}
          weight="fill"
          className={cn("text-green-500 shrink-0")}
        />
      )}
      {isGap && (
        <XCircleIcon
          size={16}
          weight="fill"
          className={cn("text-red-500 shrink-0")}
        />
      )}
      {!isFit && !isGap && (
        <MinusCircleIcon
          size={16}
          weight="fill"
          className={cn("text-yellow-500 shrink-0")}
        />
      )}
      <Badge
        intent="default"
        className={cn(
          "border-0",
          isFit && "bg-bg-success-subtle",
          isGap && "bg-bg-error-subtle",
          !isFit && !isGap && "bg-bg-warning-subtle",
        )}
      >
        <span
          className={cn(
            isFit && "text-green-600",
            isGap && "text-red-600",
            !isFit && !isGap && "text-yellow-700",
          )}
        >
          {verdict.charAt(0).toUpperCase() + verdict.slice(1)}
        </span>
      </Badge>
    </>
  );
}
