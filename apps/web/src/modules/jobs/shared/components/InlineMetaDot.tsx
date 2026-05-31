"use client";

import { cn } from "@job-tracker/ui";

type InlineMetaDotProps = { className?: string };
export function InlineMetaDot({ className }: InlineMetaDotProps) {
  return (
    <span className={cn("text-text-muted", className)} aria-hidden>
      ·
    </span>
  );
}
