"use client";

import { cn, ListItemCard, Text } from "@job-tracker/ui";

import type { ImporterRow } from "@/modules/imports/hooks/useImportersListViewModel";
import { looksLikeUuid } from "@/modules/imports/utils/looks-like-uuid";

export function ImporterListCard({
  importer,
  onDetailsClick,
}: {
  importer: ImporterRow;
  /** When set, opening details is wired to the title control (aligned with ApplicationCard title → detail UX). */
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
          {importer.name}
        </button>
      </ListItemCard.Title>
    ) : (
      <ListItemCard.Title className={cn("font-semibold")}>
        {importer.name}
      </ListItemCard.Title>
    );

  const meta = looksLikeUuid(importer.importerId) ? undefined : (
    <Text size="sm" color="secondary" className={cn("font-mono text-xs")}>
      {importer.importerId}
    </Text>
  );

  return <ListItemCard title={title} meta={meta} />;
}
