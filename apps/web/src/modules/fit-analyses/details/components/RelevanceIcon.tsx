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

export function RelevanceIcon({
  weight,
  type,
}: {
  weight?: string | null;
  type?: string | null;
}) {
  if (!weight && !type) return null;

  return (
    <div className={cn("flex items-center gap-1 shrink-0")}>
      {weight === "high" && (
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
      {weight === "low" && (
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
      {!!weight && weight !== "high" && weight !== "low" && (
        <div
          className={cn(
            "size-7 flex items-center justify-center text-xs text-neutral-500",
          )}
        >
          {weight}
        </div>
      )}
      {type === "MUST_HAVE" && (
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
      {type === "NICE_TO_HAVE" && (
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
      {type === "SOFT_SKILL" && (
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
