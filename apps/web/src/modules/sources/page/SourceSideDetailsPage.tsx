"use client";

import { cn, SideDetails, Text } from "@job-tracker/ui";

import type { SourceProfileRow } from "@/modules/sources/hooks/useSourcesListViewModel";
import { SourceProfileTemplatesList } from "@/modules/sources/page/SourceProfileTemplatesList";
import { looksLikeUuid } from "@/modules/sources/utils/looks-like-uuid";

type SourceSideDetailsPageProps = {
  sourceProfile: SourceProfileRow | null;
  onOpenChange: (open: boolean) => void;
};

export function SourceSideDetailsPage({
  sourceProfile,
  onOpenChange,
}: SourceSideDetailsPageProps) {
  const sourceProfileId = sourceProfile?.sourceProfileId ?? "";

  return (
    <SideDetails
      layout="inline"
      open={sourceProfile !== null}
      onOpenChange={onOpenChange}
      contentClassName={cn(
        "size-full min-h-0 min-w-0  max-w-none sm:max-w-none lg:h-full lg:max-w-none",
      )}
      title={sourceProfile ? `Sources · ${sourceProfile.name}` : undefined}
      accessibilityTitle={
        sourceProfile ? `Sources for ${sourceProfile.name}` : "Source details"
      }
      description={
        sourceProfile && !looksLikeUuid(sourceProfile.sourceProfileId) ? (
          <Text size="sm" color="secondary" className={cn("font-mono text-xs")}>
            {sourceProfile.sourceProfileId}
          </Text>
        ) : undefined
      }
    >
      {sourceProfile !== null ? (
        <SourceProfileTemplatesList sourceProfileId={sourceProfileId} />
      ) : null}
    </SideDetails>
  );
}
