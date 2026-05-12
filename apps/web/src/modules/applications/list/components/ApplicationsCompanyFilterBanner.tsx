"use client";

import { Badge, cn, Text } from "@job-tracker/ui";

type ApplicationsCompanyFilterBannerProps = {
  companyName: string | null | undefined;
  onClear: () => void;
};

export function ApplicationsCompanyFilterBanner({
  companyName,
  onClear,
}: ApplicationsCompanyFilterBannerProps) {
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
          "text-xs text-text-brand underline-offset-2 hover:underline",
        )}
      >
        Clear
      </button>
    </div>
  );
}
