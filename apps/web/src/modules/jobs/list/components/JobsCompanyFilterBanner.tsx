"use client";

import { Badge, cn, Text } from "@job-tracker/ui";

type JobsCompanyFilterBannerProps = {
  companyName: string | null | undefined;
  onClear: () => void;
};

export function JobsCompanyFilterBanner({ companyName, onClear }: JobsCompanyFilterBannerProps) {
  if (!companyName) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
      )}
    >
      <Text size="sm" color="muted">
        Filtering by company:
      </Text>
      <Badge>{companyName}</Badge>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          "cursor-pointer text-xs font-semibold text-text-primary underline-offset-2 hover:underline",
        )}
      >
        Clear
      </button>
    </div>
  );
}
