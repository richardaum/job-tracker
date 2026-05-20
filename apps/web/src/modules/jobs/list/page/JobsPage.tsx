"use client";

import {
  Button,
  Card,
  cn,
  Skeleton,
  Stack,
  Text,
  useDialog,
} from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { JobCard } from "@/modules/jobs/list/components/JobCard";
import { JobQuickEditDialog } from "@/modules/jobs/list/components/JobQuickEditDialog";
import { JobsCompanyFilterBanner } from "@/modules/jobs/list/components/JobsCompanyFilterBanner";
import { JobsImportRunFilterBanner } from "@/modules/jobs/list/components/JobsImportRunFilterBanner";
import { QuickFilters } from "@/modules/jobs/list/components/QuickFilters";
import { useJobsListViewModel } from "@/modules/jobs/list/hooks/useJobsListViewModel";
import { SearchInput } from "@/modules/jobs/shared/components/SearchInput";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";

function JobListCardSkeleton() {
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
            <Skeleton className={cn("h-6 w-20 shrink-0 rounded-full")} />
            <div className={cn("flex items-center gap-1")}>
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
              <Skeleton className={cn("size-6 rounded-sm")} />
            </div>
          </div>
          <div className={cn("flex flex-wrap items-center gap-2")}>
            <Skeleton variant="text" className={cn("h-4 w-28 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-44 max-w-full")} />
            <Skeleton variant="text" className={cn("h-4 w-24 max-w-full")} />
          </div>
          <div className={cn("space-y-1")}>
            <Skeleton variant="text" className={cn("h-4 w-full max-w-2xl")} />
            <Skeleton variant="text" className={cn("h-4 w-full max-w-lg")} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function JobsListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <JobListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function JobsListError() {
  return (
    <Text size="sm" color="error">
      Failed to load jobs. Please refresh the page.
    </Text>
  );
}

export default function JobsPage() {
  const router = useRouter();
  const { jobs, companyFilter, error, runIdFilter, showInitialLoading } =
    useJobsListViewModel();

  const { enqueueToast } = useToastQueue();

  const newJob = useDialog();

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
        <SearchInput placeholder="Search jobs..." shortcutHint="⌘/" />

        <div className={cn("w-full sm:w-auto")}>
          <JobQuickEditDialog
            control={newJob}
            onSuccess={(msg) => showToast(msg, "success")}
            onError={(msg) => showToast(msg, "error")}
            onCreated={(jobId) => {
              router.push(`/jobs/${jobId}`);
            }}
          />
          <Button intent="primary" size="md" onClick={newJob.open}>
            <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
            New job
          </Button>
        </div>
      </div>

      {/* Quick filters */}
      <QuickFilters />
      <JobsCompanyFilterBanner
        companyName={companyFilter}
        onClear={() => router.push("/jobs")}
      />
      <JobsImportRunFilterBanner
        runId={runIdFilter}
        onClear={() => {
          router.push("/jobs");
        }}
      />

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <JobsListSkeleton />
        ) : error ? (
          <JobsListError />
        ) : jobs.length === 0 ? (
          <EmptyState
            variant="default"
            message="No jobs yet."
            detail="Add your first one to start tracking."
          />
        ) : (
          <Stack gap="sm">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
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
