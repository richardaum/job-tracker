"use client";

import { cn } from "@job-tracker/ui";

import { buildCapturedHtmlSrcDoc } from "@/lib/captured-html-iframe-srcdoc";

type SourceContentTabContentProps = { htmlContent: string };
export function SourceContentTabContent({ htmlContent }: SourceContentTabContentProps) {
  return (
    <div
      className={cn(
        "flex size-full min-h-0  flex-col overflow-hidden rounded-md border border-border-subtle bg-bg-surface",
      )}
    >
      <iframe
        title="Source posting HTML"
        srcDoc={buildCapturedHtmlSrcDoc(htmlContent)}
        sandbox=""
        referrerPolicy="no-referrer"
        className={cn("h-full min-h-0 flex-1 border-0")}
      />
    </div>
  );
}
