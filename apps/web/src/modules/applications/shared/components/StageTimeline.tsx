"use client";

import type { ReactNode } from "react";
import { ApplicationStage } from "@/gql/hooks";
import { Text, cn } from "@job-tracker/ui";
import { formatStage } from "./StatusBadge";

interface StageTimelineItem {
  id: string;
  fromStage?: ApplicationStage | null;
  toStage: ApplicationStage;
  dateLabel: string;
}

export function StageTimeline({
  items,
  variant = "default",
  className,
  renderItemAction,
}: {
  items: StageTimelineItem[];
  variant?: "default" | "compact";
  className?: string;
  renderItemAction?: (item: StageTimelineItem) => ReactNode;
}) {
  const isCompact = variant === "compact";

  if (items.length === 0) {
    return (
      <Text size={isCompact ? "xs" : "sm"} color="muted">
        No status history yet.
      </Text>
    );
  }

  return (
    <div className={cn(isCompact ? "space-y-1.5" : "space-y-3", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn("flex", isCompact ? "gap-2" : "gap-3")}
        >
          <div
            className={cn(
              "relative shrink-0 items-center justify-center",
              isCompact ? "flex w-3" : "flex w-4",
            )}
            aria-hidden
          >
            {index > 0 ? (
              <span
                className={cn(
                  "absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border-subtle",
                  isCompact
                    ? "bottom-[calc(50%+8px)]"
                    : "bottom-[calc(50%+16px)]",
                )}
              />
            ) : null}
            <span
              className={cn(
                "block shrink-0 rounded-full bg-current",
                isCompact ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
                getStageTimelineDotColor(item.toStage),
              )}
            />
            {index < items.length - 1 ? (
              <span
                className={cn(
                  "absolute left-1/2 w-px -translate-x-1/2 bg-border-subtle",
                  isCompact
                    ? "-bottom-1.5 top-[calc(50%+8px)]"
                    : "-bottom-3 top-[calc(50%+16px)]",
                )}
              />
            ) : null}
          </div>
          <div
            className={cn(
              "min-w-0 flex-1",
              isCompact
                ? ""
                : "rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2",
            )}
          >
            <div className={cn("inline-flex items-center gap-1.5")}>
              <Text size={isCompact ? "xs" : "sm"} weight="medium">
                {item.fromStage ? (
                  <>
                    {formatStage(item.fromStage)} {"->"}{" "}
                    {formatStage(item.toStage)}
                  </>
                ) : (
                  formatStage(item.toStage)
                )}
              </Text>
              {renderItemAction ? renderItemAction(item) : null}
            </div>
            <Text
              size="xs"
              color="muted"
              className={cn(isCompact ? "" : "mt-1")}
            >
              {item.dateLabel}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStageTimelineDotColor(stage: ApplicationStage) {
  switch (stage) {
    case ApplicationStage.Offer:
      return "text-text-success";
    case ApplicationStage.Rejected:
      return "text-text-error";
    case ApplicationStage.RecruiterScreen:
      return "text-text-warning";
    case ApplicationStage.Technical:
      return "text-text-brand";
    default:
      return "text-text-secondary";
  }
}
