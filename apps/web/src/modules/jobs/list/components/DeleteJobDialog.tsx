"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import type { ReactElement } from "react";

import { DeleteJobDocument, JobsDocument, useDeleteJobMutation } from "@/gql/hooks";
import { removeDeletedEntityFromListCache } from "@/modules/jobs/shared/utils/apolloDeleteCache";

interface DeleteJobDialogProps {
  trigger: ReactElement;
  jobId: string;
  jobTitle: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteJobDialog({
  trigger,
  jobId,
  jobTitle,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteJobDialogProps) {
  const [deleteJob] = useDeleteJobMutation({
    update(cache, { data }) {
      removeDeletedEntityFromListCache(cache, { mutationData: data, mutation: DeleteJobDocument, query: JobsDocument });
    },
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete job"
      description={`Are you sure you want to delete "${jobTitle}"? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={async () => {
        const [err] = await tryRun(deleteJob({ variables: { id: jobId } }));
        if (err) {
          onError?.("Could not delete the job. Please try again.");
          throw err;
        }
        onSuccess?.(`"${jobTitle}" was deleted.`);
      }}
    />
  );
}
