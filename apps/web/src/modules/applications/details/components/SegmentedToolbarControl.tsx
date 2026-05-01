"use client";

import { cn } from "@job-tracker/ui";
import React from "react";

import {
  ToolbarButton,
  type ToolbarButtonProps,
} from "@/modules/applications/details/components/ToolbarButton";

interface SegmentedToolbarControlProps {
  children: React.ReactNode;
}

export function SegmentedToolbarControl({
  children,
}: SegmentedToolbarControlProps) {
  const visibleItems = React.Children.toArray(children).filter(
    Boolean,
  ) as React.ReactElement<ToolbarButtonProps>[];
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex overflow-hidden rounded border border-border-subtle",
      )}
    >
      {visibleItems.map((item, index) => {
        const isLastItem = index === visibleItems.length - 1;
        return (
          <ToolbarButton
            {...item.props}
            key={item.key ?? String(index)}
            className={cn(
              "rounded-none border-0",
              !isLastItem && "border-r border-border-subtle",
              item.props.className,
            )}
          />
        );
      })}
    </div>
  );
}
