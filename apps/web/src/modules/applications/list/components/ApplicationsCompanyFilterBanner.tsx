"use client";

import { cn, Text } from "@job-tracker/ui";

type ApplicationsCompanyFilterBannerProps = {
  companyName: string | null | undefined;
};

export function ApplicationsCompanyFilterBanner({
  companyName,
}: ApplicationsCompanyFilterBannerProps) {
  if (!companyName) return null;

  return (
    <div className={cn("border-b border-border-subtle px-4 py-2 sm:px-6")}>
      <Text size="sm" color="secondary">
        Filtering by company:{" "}
        <Text as="span" weight="semibold">
          {companyName}
        </Text>
      </Text>
    </div>
  );
}
