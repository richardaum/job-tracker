"use client";

import { Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";

import { EmptyState } from "@/components/empty-state";
import { DraftJobCard } from "@/modules/draft-jobs/list/components/DraftJobCard";
import { useDraftJobsListViewModel } from "@/modules/draft-jobs/list/hooks/useDraftJobsListViewModel";
import { SearchInput } from "@/modules/jobs/shared/components/SearchInput";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

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

function DraftJobsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <DraftListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function DraftJobsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load drafts. Please refresh the page.
    </Text>
  );
}

export default function DraftJobsPage() {
  const { drafts, error, showInitialLoading } = useDraftJobsListViewModel();
  const { enqueueToast } = useToastQueue();

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4  sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput placeholder="Search drafts..." shortcutHint="⌘/" />

        <div className={cn("w-full sm:w-auto")} />
      </div>

      {/* Secondary row — mirrors QuickFilters strip height */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
        )}
      >
        <Text size="sm" color="muted">
          Saved imports from the browser extension and pasted content appear
          here.
        </Text>
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <DraftJobsListSkeleton />
        ) : error ? (
          <DraftJobsListError />
        ) : drafts.length === 0 ? (
          <EmptyState
            variant="default"
            message="No draft jobs yet."
            detail="Import a job page from the extension to create one."
          />
        ) : (
          <Stack gap="sm">
            {drafts.map((draft) => (
              <DraftJobCard
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
