"use client";

import { Button, Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { SearchInput } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { useSourcesListViewModel } from "@/modules/sources/hooks/useSourcesListViewModel";
import { SourceListCard } from "@/modules/sources/list/components/SourceListCard";

import { NewSourceDialog } from "./NewSourceDialog";

function SourceListCardSkeleton() {
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

function SourceProfilesListSkeleton({ count = 4 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <SourceListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function SourceProfilesListError() {
  return (
    <Text size="sm" color="error">
      Failed to load sources. Please refresh the page.
    </Text>
  );
}

export function SourcesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    sourceProfiles,
    searchQuery,
    setSearchQuery,
    error,
    showInitialLoading,
  } = useSourcesListViewModel();

  const [newSourceOpen, setNewSourceOpen] = useState(false);

  function onSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value);
  }

  const searchActive = searchQuery.trim().length > 0;
  const hasDetail = pathname !== "/sources" && !pathname.includes("/template/");

  return (
    <div className={cn("flex h-full flex-col")}>
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput
          placeholder="Search sources..."
          shortcutHint="⌘/"
          ariaLabel="Search sources"
          value={searchQuery}
          onChange={onSearchChange}
        />

        <div className={cn("w-full sm:w-auto")}>
          <Button
            intent="primary"
            size="md"
            type="button"
            onClick={() => setNewSourceOpen(true)}
          >
            <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
            New source
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          hasDetail &&
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
              <SourceProfilesListSkeleton />
            ) : error ? (
              <SourceProfilesListError />
            ) : sourceProfiles.length === 0 && searchActive ? (
              <EmptyState
                variant="filtered"
                hasActiveFilter
                noMatchMessage="No source profiles match your search."
                emptyListMessage="No source profiles yet."
                noMatchDetail="Try a different name or source profile id."
              />
            ) : sourceProfiles.length === 0 ? (
              <EmptyState
                variant="default"
                message="No source profiles with sources yet."
                detail="Only source profiles that already have at least one source are listed. Add a source for a source profile to see it here."
              />
            ) : (
              <Stack gap="sm">
                {sourceProfiles.map((sourceProfile) => (
                  <SourceListCard
                    key={sourceProfile.sourceProfileId}
                    sourceProfile={sourceProfile}
                    onDetailsClick={() =>
                      router.push(
                        `/sources/profile/${sourceProfile.sourceProfileId}`,
                      )
                    }
                  />
                ))}
              </Stack>
            )}
          </div>
        </div>

        {hasDetail ? (
          <div className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden")}>
            {children}
          </div>
        ) : null}
      </div>

      <NewSourceDialog
        open={newSourceOpen}
        onOpenChange={setNewSourceOpen}
        onCreated={(sourceProfile) =>
          router.push(`/sources/profile/${sourceProfile.sourceProfileId}`)
        }
      />
    </div>
  );
}
