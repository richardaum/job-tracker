"use client";

import { cn } from "@job-tracker/ui";

export function SourceContentTabContent({
  htmlContent,
}: {
  htmlContent: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full min-h-0  flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-surface",
      )}
    >
      <iframe
        title="Source posting HTML"
        srcDoc={htmlContent}
        sandbox=""
        className={cn("h-full min-h-0 flex-1 border-0")}
      />
    </div>
  );
}
