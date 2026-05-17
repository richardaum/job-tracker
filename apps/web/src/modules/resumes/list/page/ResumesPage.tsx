"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Skeleton, Stack, Text } from "@job-tracker/ui";
import { BriefcaseIcon, PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { EmptyState } from "@/components/empty-state";
import {
  ResumesDocument,
  useDeleteResumeMutation,
  useResumesQuery,
  useUpdateResumeMutation,
} from "@/gql/hooks";
import { SearchInput } from "@/modules/applications/shared/components/SearchInput";
import { useToastQueue } from "@/modules/applications/shared/hooks/useToastQueue";
import { AddResumeDialog } from "@/modules/resumes/list/components/AddResumeDialog";
import { ResumeCard } from "@/modules/resumes/list/components/ResumeCard";
import { PreferencesDialog } from "@/modules/work-preferences/components/PreferencesDialog";

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

export default function ResumesPage() {
  const { data, loading, error } = useResumesQuery({
    fetchPolicy: "cache-and-network",
  });
  const [deleteResume] = useDeleteResumeMutation({
    refetchQueries: [{ query: ResumesDocument }],
    awaitRefetchQueries: true,
  });
  const [updateResume] = useUpdateResumeMutation({
    refetchQueries: [{ query: ResumesDocument }],
    awaitRefetchQueries: true,
  });

  const { enqueueToast } = useToastQueue();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const resumes = data?.resumes ?? [];
  const showInitialLoading = loading && !data;

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  async function handleSetAsDefault(id: string) {
    const [err] = await tryRun(
      updateResume({ variables: { id, input: { isDefault: true } } }),
    );
    if (err) {
      showToast(err.message, "error");
      return;
    }
    showToast("Default resume updated.", "success");
  }

  async function handleDelete(id: string, title: string) {
    const [err] = await tryRun(deleteResume({ variables: { id } }));
    if (err) {
      showToast(err.message, "error");
      return;
    }
    showToast(`"${title}" deleted.`, "success");
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
            <BriefcaseIcon
              size={14}
              weight="regular"
              className={cn("mr-1.5")}
            />
            Work Preferences
          </Button>

          <Button
            intent="primary"
            size="md"
            onClick={() => setAddDialogOpen(true)}
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
                onDelete={(id, title) => void handleDelete(id, title)}
                onSetAsDefault={(id) => void handleSetAsDefault(id)}
              />
            ))}
          </Stack>
        )}
      </div>

      <PreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />

      <AddResumeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
