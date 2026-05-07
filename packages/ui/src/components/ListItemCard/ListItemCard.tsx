import { Card } from "@ui/components/Card/Card";
import { cn } from "@ui/lib/cn";
import React from "react";

export interface ListItemCardProps {
  title: React.ReactNode;
  actions?: React.ReactNode | React.ReactNode[];
  meta?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function ListItemCard({
  title,
  actions,
  meta,
  description,
  className,
}: ListItemCardProps) {
  const actionItems = React.Children.toArray(actions);
  const hasActions = actionItems.length > 0;

  return (
    <Card padding="sm" className={className}>
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            {title}
            {hasActions ? (
              <div className={cn("flex items-center gap-1")}>
                {actionItems.map((action, index) => (
                  <div key={index} className={cn("shrink-0")}>
                    {action}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          {meta ? (
            <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
              {meta}
            </div>
          ) : null}
          {description ? (
            <div className={cn("min-w-0")}>{description}</div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
