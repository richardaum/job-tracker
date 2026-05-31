"use client";

import { Button, cn, Stack, Text } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";

import { EmptyStateCard, type EmptyStateCardProps } from "./EmptyStateCard";

export type EmptyStateActionHintProps = {
  headline: string;
  description?: string;
  /** Mirrors the primary toolbar action (e.g. New run). */
  actionLabel?: string;
  onAction: () => void;
  className?: string;
  padding?: EmptyStateCardProps["padding"];
  layout?: EmptyStateCardProps["layout"];
};

export function EmptyStateActionHint({
  headline,
  description,
  actionLabel = "New run",
  onAction,
  className,
  padding,
  layout,
}: EmptyStateActionHintProps) {
  return (
    <EmptyStateCard className={cn(className)} padding={padding ?? "5xl"} layout={layout}>
      <Stack gap="md" align="center" className={cn("max-w-sm")}>
        <Stack gap="xs" align="center">
          <Text as="p" size="base" weight="semibold" color="primary" className={cn("leading-snug")}>
            {headline}
          </Text>
          {description ? (
            <Text as="p" size="sm" color="muted" className={cn("leading-relaxed")}>
              {description}
            </Text>
          ) : null}
        </Stack>
        <Button
          intent="primary"
          size="sm"
          type="button"
          leftIcon={<PlusIcon size={14} weight="bold" />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </Stack>
    </EmptyStateCard>
  );
}
