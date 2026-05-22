"use client";

import {
  cn,
  Text,
  Timeline,
  TimelineContent,
  TimelineItem,
  TimelineMarker,
} from "@job-tracker/ui";
import { ArrowRightIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/empty-state";
import { JobStage } from "@/gql/hooks";
import { formatStage } from "@/modules/jobs/shared/components/status-badge.utils";

interface StageTimelineItem {
  id: string;
  fromStage?: JobStage | null;
  toStage: JobStage;
  reason?: string | null;
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
      <EmptyState
        variant="panel"
        message="No status history yet."
        size={isCompact ? "xs" : "sm"}
      />
    );
  }

  return (
    <Timeline
      className={cn(isCompact ? "space-y-1.5" : "space-y-3", className)}
    >
      {items.map((item, index) => (
        <TimelineItem
          key={item.id}
          className={cn(isCompact ? "gap-2" : "gap-3")}
        >
          <TimelineMarker
            className={cn(isCompact ? "w-3" : "w-4")}
            showTopConnector={index > 0}
            showBottomConnector={index < items.length - 1}
            dotClassName={cn(
              isCompact ? "size-1.5 " : "size-2.5 ",
              getStageTimelineDotColor(item.toStage),
            )}
            topConnectorClassName={cn(
              isCompact ? "bottom-[calc(50%+8px)]" : "bottom-[calc(50%+16px)]",
            )}
            bottomConnectorClassName={cn(
              isCompact
                ? "-bottom-1.5 top-[calc(50%+8px)]"
                : "-bottom-3 top-[calc(50%+16px)]",
            )}
          />
          <TimelineContent
            className={cn(
              "min-w-0",
              isCompact ? "border-0 bg-transparent p-0 " : "",
            )}
          >
            <div className={cn("inline-flex items-center gap-1.5")}>
              <Text size={isCompact ? "xs" : "sm"} weight="medium">
                {item.fromStage ? (
                  <>
                    {formatStage(item.fromStage)}{" "}
                    <ArrowRightIcon
                      aria-hidden
                      className={cn(
                        "inline-block shrink-0 align-[-0.125em] text-current",
                      )}
                      size={isCompact ? 12 : 14}
                      weight="bold"
                    />{" "}
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
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function getStageTimelineDotColor(stage: JobStage) {
  switch (stage) {
    case JobStage.Offer:
      return "text-text-success";
    case JobStage.Rejected:
      return "text-text-error";
    case JobStage.RecruiterScreen:
      return "text-text-warning";
    case JobStage.Technical:
      return "text-text-brand";
    case JobStage.CulturalFit:
      return "text-text-brand";
    case JobStage.Duplicated:
      return "text-text-warning";
    default:
      return "text-text-secondary";
  }
}
