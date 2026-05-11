"use client";

import { Button, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { GearIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { PreferencesModal } from "@/modules/resumes/list/components/PreferencesModal";
import { ResumeCard } from "@/modules/resumes/list/components/ResumeCard";
/* MOCK DATA: replace useMockResumes with a real ViewModel hook
   that queries GraphQL (T-176 / T-180). */
import { useMockResumes } from "@/modules/resumes/list/hooks/useMockResumes";

function ResumesListCardSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border-default bg-bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between",
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
        <div className={cn("space-y-1")}>
          <Skeleton variant="text" className={cn("h-4 w-full max-w-2xl")} />
          <Skeleton variant="text" className={cn("h-4 w-full max-w-lg")} />
        </div>
      </div>
    </div>
  );
}

function ResumesListSkeleton({ count = 3 }: { count?: number } = {}) {
  return (
    <Stack gap="sm">
      {Array.from({ length: count }, (_, i) => (
        <ResumesListCardSkeleton key={i} />
      ))}
    </Stack>
  );
}

function ResumesListError() {
  return (
    <Text size="sm" color="error">
      Failed to load resumes. Please refresh the page.
    </Text>
  );
}

/* MOCK DATA: the entire ResumesPage will use real queries+mutations
   when T-176 and T-180 land. The structure (action bar, skeleton,
   empty state, list) stays the same — only data sourcing changes. */
export default function ResumesPage() {
  /* MOCK DATA: destructure from a real view-model hook later:
       const { resumes, loading, error, showInitialLoading } = useResumesListViewModel();
  */
  const { resumes, error, showInitialLoading } = useMockResumes();

  const { enqueueToast } = useToastQueue();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [_addDialogOpen, setAddDialogOpen] = useState(false);

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  return (
    <div className={cn("flex h-full flex-col")}>
      {/* Action bar */}
      <div
        className={cn(
          "flex flex-col gap-3 border-b border-border-subtle p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        )}
      >
        <SearchInput placeholder="Search resumes..." shortcutHint="⌘/" />

        <div
          className={cn("flex w-full flex-wrap items-center gap-2 sm:w-auto")}
        >
          <Button
            intent="secondary"
            size="md"
            onClick={() => setPreferencesOpen(true)}
          >
            <GearIcon size={14} weight="regular" className={cn("mr-1.5")} />
            Preferences
          </Button>

          {/* MOCK DATA: replace with real navigation or dialog (T-179) */}
          <Button
            intent="primary"
            size="md"
            onClick={() => {
              setAddDialogOpen(true);
              showToast(
                "Add resume dialog — handler pending (T-179)",
                "success",
              );
            }}
          >
            <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
            Add resume
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn("flex min-h-0 flex-1 flex-col overflow-auto p-4 sm:p-6")}
      >
        {showInitialLoading ? (
          <ResumesListSkeleton />
        ) : error ? (
          <ResumesListError />
        ) : resumes.length === 0 ? (
          <EmptyState
            variant="default"
            message="No resumes yet."
            detail="Add your first resume to start tracking your profile versions."
          />
        ) : (
          <Stack gap="sm">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onSuccess={(msg) => showToast(msg, "success")}
              />
            ))}
          </Stack>
        )}
      </div>

      <PreferencesModal
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </div>
  );
}
