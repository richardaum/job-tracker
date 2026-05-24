"use client";

import { cn, Tooltip } from "@job-tracker/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  FlagIcon,
  HeartIcon,
  StarIcon,
} from "@phosphor-icons/react";
import React from "react";

import { RequirementType, Weight } from "@/gql/hooks";

export function RelevanceIcon({
  weight,
  type,
}: {
  weight?: Weight | null;
  type?: RequirementType | null;
}) {
  if (!weight && !type) return null;

  return (
    <div className={cn("flex items-center gap-1 shrink-0")}>
      {weight === Weight.High && (
        <Tooltip content="High priority">
          <div className={cn("size-7 flex items-center justify-center")}>
            <ArrowUpIcon
              size={16}
              weight="bold"
              className={cn("text-neutral-800")}
            />
          </div>
        </Tooltip>
      )}
      {weight === Weight.Low && (
        <Tooltip content="Low priority">
          <div className={cn("size-7 flex items-center justify-center")}>
            <ArrowDownIcon
              size={16}
              weight="bold"
              className={cn("text-neutral-500")}
            />
          </div>
        </Tooltip>
      )}
      {type === RequirementType.MustHave && (
        <Tooltip content="Required">
          <div className={cn("size-7 flex items-center justify-center")}>
            <FlagIcon
              size={16}
              weight="fill"
              className={cn("text-neutral-800")}
            />
          </div>
        </Tooltip>
      )}
      {type === RequirementType.NiceToHave && (
        <Tooltip content="Nice to have">
          <div className={cn("size-7 flex items-center justify-center")}>
            <StarIcon
              size={16}
              weight="fill"
              className={cn("text-neutral-600")}
            />
          </div>
        </Tooltip>
      )}
      {type === RequirementType.SoftSkill && (
        <Tooltip content="Soft skill">
          <div className={cn("size-7 flex items-center justify-center")}>
            <HeartIcon
              size={16}
              weight="fill"
              className={cn("text-neutral-500")}
            />
          </div>
        </Tooltip>
      )}
    </div>
  );
}
