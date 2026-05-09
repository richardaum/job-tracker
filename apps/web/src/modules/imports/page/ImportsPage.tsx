"use client";

import { Button, Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import {
  type ImporterRow,
  useImportersListViewModel,
} from "@/modules/imports/hooks/useImportersListViewModel";
import { ImporterListCard } from "@/modules/imports/list/components/ImporterListCard";

import { ImportTemplateSideDetails } from "./ImportTemplateSideDetails";
import { NewImportTemplateDialog } from "./NewImportTemplateDialog";

function ImporterListCardSkeleton() {
  return (
    <Card padding="sm">
      <div className={cn("space-y-2")}>
        <Skeleton
          variant="text"
          className={cn("h-5 w-[min(14rem,100%)] max-w-full")}
        />
        <Skeleton variant="text" className={cn("h-4 w-48 max-w-full")} />
      </div>
    </Card>
  );
}

function ImportersListSkeleton({ count = 4 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <ImporterListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function ImportersListError() {
  return (
    <Text size="sm" color="error">
      Failed to load importers. Please refresh the page.
    </Text>
  );
}

export default function ImportsPage() {
  const { importers, searchQuery, setSearchQuery, error, showInitialLoading } =
    useImportersListViewModel();

  const [templateDetailImporter, setTemplateDetailImporter] =
    useState<ImporterRow | null>(null);

  const [newImportTemplateOpen, setNewImportTemplateOpen] = useState(false);

  function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value);
  }

  function onTemplateSideDetailsChange(nextOpen: boolean) {
    if (!nextOpen) setTemplateDetailImporter(null);
  }

  function openTemplateDetails(importer: ImporterRow) {
    setTemplateDetailImporter(importer);
  }

  const searchActive = searchQuery.trim().length > 0;

  return (
    <div className={cn("flex h-full flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput
          placeholder="Search importers..."
          shortcutHint="⌘/"
          ariaLabel="Search importers"
          value={searchQuery}
          onChange={onSearchChange}
        />

        <div className={cn("w-full sm:w-auto")}>
          <Button
            intent="primary"
            size="md"
            type="button"
            onClick={() => setNewImportTemplateOpen(true)}
          >
            <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
            New import template
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          templateDetailImporter !== null &&
            "lg:grid lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:grid-rows-1",
        )}
      >
        <div
          className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden")}
        >
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6",
            )}
          >
            {showInitialLoading ? (
              <ImportersListSkeleton />
            ) : error ? (
              <ImportersListError />
            ) : importers.length === 0 && searchActive ? (
              <EmptyState
                variant="filtered"
                hasActiveFilter
                noMatchMessage="No importers match your search."
                emptyListMessage="No importers yet."
                noMatchDetail="Try a different name or importer id."
              />
            ) : importers.length === 0 ? (
              <EmptyState
                variant="default"
                message="No importers with a template yet."
                detail="Only importers that already have at least one import template are listed. Add a template for an importer to see it here."
              />
            ) : (
              <Stack gap="sm">
                {importers.map((importer) => (
                  <ImporterListCard
                    key={importer.importerId}
                    importer={importer}
                    onDetailsClick={() => openTemplateDetails(importer)}
                  />
                ))}
              </Stack>
            )}
          </div>
        </div>

        {templateDetailImporter !== null ? (
          <div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden")}>
            <ImportTemplateSideDetails
              importer={templateDetailImporter}
              onOpenChange={onTemplateSideDetailsChange}
            />
          </div>
        ) : null}
      </div>

      <NewImportTemplateDialog
        open={newImportTemplateOpen}
        onOpenChange={setNewImportTemplateOpen}
        onCreated={(importer) =>
          setTemplateDetailImporter({
            importerId: importer.importerId,
            name: importer.name,
          })
        }
      />
    </div>
  );
}
