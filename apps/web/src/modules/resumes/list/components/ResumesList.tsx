"use client";

import { cn, Skeleton, Stack, Text } from "@job-tracker/ui";

import { EmptyState } from "@/components/empty-state";
import type { ResumeType } from "@/gql/hooks";
import { ResumeCard } from "@/modules/resumes/list/components/ResumeCard";

interface ResumesListProps {
  resumes: Pick<ResumeType, "id" | "title" | "content" | "isDefault" | "createdAt" | "updatedAt">[];
  loading: boolean;
  error?: Error;
  onDelete: (id: string, title: string) => Promise<void>;
  onSetAsDefault: (id: string) => Promise<void>;
}

export function ResumesList({ resumes, loading, error, onDelete, onSetAsDefault }: ResumesListProps) {
  if (loading) {
    return <ResumesListSkeleton />;
  }

  if (error) {
    return <ResumesListError />;
  }

  if (resumes.length === 0) {
    return (
      <EmptyState
        variant="default"
        message="No resumes yet."
        detail="Add your first resume to start tracking your profile versions."
      />
    );
  }

  return (
    <Stack gap="sm">
      {resumes.map((resume) => (
        <ResumeCard
          key={resume.id}
          resume={resume}
          onDelete={(id, title) => void onDelete(id, title)}
          onSetAsDefault={(id) => void onSetAsDefault(id)}
        />
      ))}
    </Stack>
  );
}

function ResumesListCardSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border-default bg-bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className={cn("flex min-w-0 flex-col gap-1")}>
        <div className={cn("flex min-w-0 flex-wrap items-center gap-2")}>
          <Skeleton variant="text" className={cn("h-5 w-[min(12rem,100%)] max-w-full")} />
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
