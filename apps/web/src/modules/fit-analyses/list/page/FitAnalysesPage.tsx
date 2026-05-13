"use client";

import { Card, cn, Skeleton, Stack, Text } from "@job-tracker/ui";

import { EmptyState } from "@/components/empty-state";
import { useFitAnalysesListQuery } from "@/gql/hooks";
import { FitAnalysisListCard } from "@/modules/fit-analyses/list/components/FitAnalysisListCard";

function FitAnalysisListCardSkeleton() {
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
              className={cn("h-5 w-[min(10rem,100%)] max-w-full")}
            />
            <Skeleton className={cn("h-6 w-16 shrink-0 rounded-full")} />
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-28 max-w-full")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function FitAnalysesListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <FitAnalysisListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

export default function FitAnalysesPage() {
  const { data, loading, error } = useFitAnalysesListQuery({
    fetchPolicy: "cache-and-network",
  });

  const fits = data?.fitAnalyses ?? [];
  const showInitialLoading = loading && !data;

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-border-subtle p-4 sm:px-6",
        )}
      >
        <Text size="base" weight="semibold">
          Fit analyses
        </Text>
      </div>

      {/* Description row */}
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border-subtle px-4 py-2 sm:px-6",
        )}
      >
        <Text size="sm" color="muted">
          All fit analyses generated from your applications and drafts.
        </Text>
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <FitAnalysesListSkeleton />
        ) : error ? (
          <Text size="sm" color="error">
            Failed to load fit analyses. Please refresh the page.
          </Text>
        ) : fits.length === 0 ? (
          <EmptyState
            variant="default"
            message="No fit analyses yet."
            detail="Generate a fit analysis from an application or draft to see them here."
          />
        ) : (
          <Stack gap="sm">
            {fits.map((fit) => (
              <FitAnalysisListCard key={fit.id} fit={fit} />
            ))}
          </Stack>
        )}
      </div>
    </div>
  );
}
