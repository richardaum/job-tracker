"use client";

import { tryRun } from "@job-tracker/try-run";
import { Button, cn } from "@job-tracker/ui";
import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

import {
  DeleteResumeDocument,
  ResumesDocument,
  useDeleteResumeMutation,
  useResumesQuery,
  useUpdateResumeMutation,
} from "@/gql/hooks";
import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { removeDeletedEntityFromListCache } from "@/modules/jobs/shared/utils/apolloDeleteCache";
import { ProfileHeaderActions } from "@/modules/profile/layout/profile-header.slots";
import { AddResumeDialog } from "@/modules/resumes/list/components/AddResumeDialog";
import ResumesList from "@/modules/resumes/list/components/ResumesList";

export default function ResumesTabPage() {
  const { data, loading, error } = useResumesQuery({
    fetchPolicy: "cache-and-network",
  });
  const [deleteResume] = useDeleteResumeMutation({
    update(cache, { data: mutationData }) {
      removeDeletedEntityFromListCache(cache, {
        mutationData,
        mutation: DeleteResumeDocument,
        query: ResumesDocument,
      });
    },
  });
  const [updateResume] = useUpdateResumeMutation({
    refetchQueries: [{ query: ResumesDocument }],
    awaitRefetchQueries: true,
  });

  const { enqueueToast } = useToastQueue();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const resumes = data?.resumes ?? [];
  const showInitialLoading = loading && !data;

  function showToast(message: string, intent: "success" | "error") {
    enqueueToast({ title: message, intent });
  }

  async function handleSetAsDefault(id: string) {
    const [err] = await tryRun(updateResume({ variables: { id, input: { isDefault: true } } }));
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
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-auto")}>
      <ProfileHeaderActions>
        <Button intent="primary" size="md" onClick={() => setAddDialogOpen(true)}>
          <PlusIcon size={16} weight="bold" className={cn("mr-2")} />
          Add resume
        </Button>
      </ProfileHeaderActions>
      <ResumesList
        resumes={resumes}
        loading={showInitialLoading}
        error={error}
        onDelete={handleDelete}
        onSetAsDefault={handleSetAsDefault}
      />

      <AddResumeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
