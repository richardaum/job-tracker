"use client";

import { cn } from "@job-tracker/ui";

export function InlineMetaDot({ className }: { className?: string }) {
  return (
    <span className={cn("text-text-muted", className)} aria-hidden>
      ·
    </span>
  );
}
