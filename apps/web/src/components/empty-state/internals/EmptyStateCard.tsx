"use client";

import { Card, type CardProps, cn, Stack } from "@job-tracker/ui";
import type { ReactNode } from "react";

export type EmptyStateCardProps = {
  children: ReactNode;
  className?: string;
  padding?: CardProps["padding"];
  /**
   * `list`: outer shell fills list slot, centers card; inner region uses ~70% min-height of slot.
   * `compact`: bordered card only.
   */
  layout?: "list" | "compact";
};

/**
 * Outlined card with centered content — shared shell for list-style empty states.
 */
export function EmptyStateCard({
  children,
  className,
  padding = "lg",
  layout = "list",
}: EmptyStateCardProps) {
  const card = (
    <Card
      variant="outlined"
      padding={padding}
      className={cn("w-full max-w-md border-border-default bg-bg-surface shadow-sm", className)}
    >
      <Stack align="center" justify="center" gap="md">
        {children}
      </Stack>
    </Card>
  );

  if (layout === "compact") {
    return card;
  }

  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col items-center justify-center")}>
      <div
        className={cn(
          "flex w-full max-w-md min-h-[70%] flex-col items-center justify-center gap-6 px-3 py-10 text-center sm:px-4",
        )}
      >
        {card}
      </div>
    </div>
  );
}
