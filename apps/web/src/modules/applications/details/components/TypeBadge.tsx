"use client";

import { Badge, cn } from "@job-tracker/ui";
import { StarIcon } from "@phosphor-icons/react";
import React from "react";

import { RequirementType } from "@/gql/hooks";
import { formatRequirementType } from "@/modules/applications/shared/utils/fitFormat";

export function TypeBadge({ type }: { type: RequirementType }) {
  return (
    <Badge
      className={cn(
        "self-end border-0",
        type === RequirementType.MustHave && "bg-bg-info-subtle",
        type === RequirementType.NiceToHave && "bg-bg-success-subtle",
      )}
      intent="default"
    >
      {type === RequirementType.NiceToHave && (
        <StarIcon
          size={10}
          weight="fill"
          className={cn("mr-0.5 text-green-600")}
        />
      )}
      <span
        className={cn(
          type === RequirementType.MustHave && "text-blue-600",
          type === RequirementType.NiceToHave && "text-green-600",
          type === RequirementType.SoftSkill && "text-text-muted",
        )}
      >
        {formatRequirementType(type)}
      </span>
    </Badge>
  );
}
