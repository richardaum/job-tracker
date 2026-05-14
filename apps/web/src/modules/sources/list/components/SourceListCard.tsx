"use client";

import { cn, ListItemCard, Text } from "@job-tracker/ui";

import type { SourceProfileRow } from "@/modules/sources/hooks/useSourcesListViewModel";
import { looksLikeUuid } from "@/modules/sources/utils/looks-like-uuid";

export function SourceListCard({
  sourceProfile,
  onDetailsClick,
}: {
  sourceProfile: SourceProfileRow;
  onDetailsClick?: () => void;
}) {
  const title =
    typeof onDetailsClick === "function" ? (
      <ListItemCard.Title
        asChild
        className={cn(
          "block w-full max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left outline-none",
        )}
      >
        <button type="button" onClick={onDetailsClick}>
          {sourceProfile.name}
        </button>
      </ListItemCard.Title>
    ) : (
      <ListItemCard.Title className={cn("font-semibold")}>
        {sourceProfile.name}
      </ListItemCard.Title>
    );

  const meta = looksLikeUuid(sourceProfile.sourceProfileId) ? undefined : (
    <Text size="sm" color="secondary" className={cn("font-mono text-xs")}>
      {sourceProfile.sourceProfileId}
    </Text>
  );

  return <ListItemCard title={title} meta={meta} />;
}
