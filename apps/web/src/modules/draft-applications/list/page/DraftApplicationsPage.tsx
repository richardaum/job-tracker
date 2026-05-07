"use client";

import { Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { EmptyState } from "@/components/empty-state";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { DraftApplicationCard } from "@/modules/draft-applications/list/components/DraftApplicationCard";
import { useDraftApplicationsListViewModel } from "@/modules/draft-applications/list/hooks/useDraftApplicationsListViewModel";

function DraftListCardSkeleton() {
  return (
    <Card padding="sm">
      <div
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={cn("flex min-w-0 flex-col gap-1")}>
          <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
            <Skeleton
              variant="text"
              className={cn("h-5 w-[min(12rem,100%)] max-w-full")}
            />
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function DraftApplicationsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <DraftListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function DraftApplicationsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load drafts. Please refresh the page.
    </Text>
  );
}

export default function DraftApplicationsPage() {
  const { drafts, error, showInitialLoading } =
    useDraftApplicationsListViewModel();
  const { enqueueToast } = useToastQueue();

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-hover px-3 py-2 sm:max-w-sm",
          )}
        >
          <MagnifyingGlassIcon
            size={14}
            weight="regular"
            className={cn("shrink-0 text-text-muted")}
          />
          <Text
            as="span"
            size="sm"
            color="muted"
            className={cn("min-w-0 flex-1")}
          >
            Search drafts...
          </Text>
          <span
            className={cn(
              "rounded border border-border-subtle px-1.5 py-0.5 text-xs text-text-muted",
            )}
          >
            ⌘/
          </span>
        </div>

        <div className={cn("w-full sm:w-auto")} />
      </div>

      {/* Secondary row — mirrors QuickFilters strip height */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
        )}
      >
        <Text size="sm" color="muted">
          Saved imports from the browser extension appear here.
        </Text>
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <DraftApplicationsListSkeleton />
        ) : error ? (
          <DraftApplicationsListError />
        ) : drafts.length === 0 ? (
          <EmptyState
            variant="default"
            message="No draft applications yet."
            detail="Import a job page from the extension to create one."
          />
        ) : (
          <Stack gap="sm">
            {drafts.map((draft) => (
              <DraftApplicationCard
                key={draft.id}
                draft={draft}
                onSuccess={(msg) => showToast(msg, "success")}
                onError={(msg) => showToast(msg, "error")}
              />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
