"use client";

import { cn, Stack, Text } from "@job-tracker/ui";

import { EmptyStateCard, type EmptyStateCardProps } from "./EmptyStateCard";

export type EmptyStateDefaultProps = {
  message: string;
  /** Second line — softer copy under the headline. */
  detail?: string;
  className?: string;
  padding?: EmptyStateCardProps["padding"];
  layout?: EmptyStateCardProps["layout"];
};

export function EmptyStateDefault({
  message,
  detail,
  className,
  padding,
  layout,
}: EmptyStateDefaultProps) {
  return (
    <EmptyStateCard className={cn(className)} padding={padding} layout={layout}>
      <Stack gap="xs" align="center" className={cn("max-w-sm")}>
        <Text as="p" size="base" weight="semibold" color="primary" className={cn("leading-snug")}>
          {message}
        </Text>
        {detail ? (
          <Text as="p" size="sm" color="muted" className={cn("leading-relaxed")}>
            {detail}
          </Text>
        ) : null}
      </Stack>
    </EmptyStateCard>
  );
}
