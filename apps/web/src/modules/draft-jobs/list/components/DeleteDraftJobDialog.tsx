"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import type { ReactElement } from "react";

import {
  ApplicationQuickFilter,
  JobsDocument,
  useDeleteJobMutation,
} from "@/gql/hooks";

interface DeleteDraftJobDialogProps {
  trigger?: ReactElement;
  draftId: string;
  draftSummary: string;
  /** @deprecated Unified jobs model deletes the capture row only. */
  hasLinkedJob?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteDraftJobDialog({
  trigger,
  draftId,
  draftSummary,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteDraftJobDialogProps) {
  const [deleteJob] = useDeleteJobMutation({
    refetchQueries: [
      {
        query: JobsDocument,
        variables: { filter: ApplicationQuickFilter.Draft },
      },
    ],
    awaitRefetchQueries: true,
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete draft"
      description={`Are you sure you want to delete this draft (${draftSummary})? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={async () => {
        const [err] = await tryRun(deleteJob({ variables: { id: draftId } }));
        if (err) {
          onError?.("Could not delete the draft. Please try again.");
          throw err;
        }
        onSuccess?.("Draft was deleted.");
      }}
    />
  );
}
