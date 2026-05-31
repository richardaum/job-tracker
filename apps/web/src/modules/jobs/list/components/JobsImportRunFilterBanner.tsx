"use client";

import { Button, cn, Text } from "@job-tracker/ui";

type JobsImportRunFilterBannerProps = {
  runId: string | null | undefined;
  onClear: () => void;
};

export function JobsImportRunFilterBanner({ runId, onClear }: JobsImportRunFilterBannerProps) {
  if (!runId) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
      )}
    >
      <Text size="sm" color="secondary">
        Showing jobs linked to import run{" "}
        <Text as="span" weight="semibold" className={cn("font-mono text-xs")}>
          {runId}
        </Text>
      </Text>
      <Button intent="secondary" size="sm" type="button" onClick={onClear}>
        Clear run filter
      </Button>
    </div>
  );
}
