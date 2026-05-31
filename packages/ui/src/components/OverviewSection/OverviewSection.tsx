import type { ReactNode } from "react";
import { cn } from "@ui/lib/cn";

export type OverviewSectionLayout = "grid" | "stack";

export interface OverviewSectionProps {
  children: ReactNode;
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
