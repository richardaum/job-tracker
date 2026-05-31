"use client";

import { cn, Stack, Text } from "@job-tracker/ui";

import { EmptyStateCard, type EmptyStateCardProps } from "./EmptyStateCard";

export type EmptyStateFilteredProps = {
  hasActiveFilter: boolean;
  noMatchMessage: string;
  emptyListMessage: string;
  noMatchDetail?: string;
  emptyListDetail?: string;
  className?: string;
  padding?: EmptyStateCardProps["padding"];
  layout?: EmptyStateCardProps["layout"];
};

export function EmptyStateFiltered({
  hasActiveFilter,
  noMatchMessage,
  emptyListMessage,
  noMatchDetail,
  emptyListDetail,
  className,
  padding,
  layout,
}: EmptyStateFilteredProps) {
  const title = hasActiveFilter ? noMatchMessage : emptyListMessage;
  const detail = hasActiveFilter ? noMatchDetail : emptyListDetail;

  return (
    <EmptyStateCard className={cn(className)} padding={padding} layout={layout}>
      <Stack gap="xs" align="center" className={cn("max-w-sm")}>
        <Text
          as="p"
          size="base"
          weight="semibold"
          color="primary"
          className={cn("leading-snug")}
        >
          {title}
        </Text>
        {detail ? (
          <Text
            as="p"
            size="sm"
            color="muted"
            className={cn("leading-relaxed")}
          >
            {detail}
          </Text>
        ) : null}
      </Stack>
    </EmptyStateCard>
  );
}
