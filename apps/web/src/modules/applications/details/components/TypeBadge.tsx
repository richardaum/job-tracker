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
        type === "must_have" && "bg-bg-info-subtle",
        type === "nice_to_have" && "bg-bg-success-subtle",
      )}
      intent="default"
    >
      {type === "nice_to_have" && (
        <StarIcon
          size={10}
          weight="fill"
          className={cn("mr-0.5 text-green-600")}
        />
      )}
      <span
        className={cn(
          type === "must_have" && "text-blue-600",
          type === "nice_to_have" && "text-green-600",
          type === "soft_skill" && "text-text-muted",
        )}
      >
        {formatRequirementType(type)}
      </span>
    </Badge>
  );
}
