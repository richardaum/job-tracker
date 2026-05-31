import { cn } from "@ui/lib/cn";
import React from "react";

export type OverviewSectionLayout = "grid" | "stack";

export interface OverviewSectionProps {
  children: React.ReactNode;
  layout?: OverviewSectionLayout;
  className?: string;
}

export function OverviewSection({ children, layout = "grid", className }: OverviewSectionProps) {
  return (
    <div
      className={cn(
        layout === "stack" ? "flex flex-col gap-3" : "flex flex-wrap items-start gap-x-8 gap-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
