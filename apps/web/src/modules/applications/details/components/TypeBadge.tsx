"use client";

import { Badge, cn } from "@job-tracker/ui";
import { StarIcon } from "@phosphor-icons/react";
import React from "react";

import { formatRequirementType } from "@/modules/applications/shared/utils/fitFormat";

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge
      className={cn(
        "self-end border-0",
        type === "MUST_HAVE" && "bg-bg-info-subtle",
        type === "NICE_TO_HAVE" && "bg-bg-success-subtle",
      )}
      intent="default"
    >
      {type === "NICE_TO_HAVE" && (
        <StarIcon
          size={10}
          weight="fill"
          className={cn("mr-0.5 text-green-600")}
        />
      )}
      <span
        className={cn(
          type === "MUST_HAVE" && "text-blue-600",
          type === "NICE_TO_HAVE" && "text-green-600",
          type === "SOFT_SKILL" && "text-text-muted",
        )}
      >
        {formatRequirementType(type)}
      </span>
    </Badge>
  );
}
