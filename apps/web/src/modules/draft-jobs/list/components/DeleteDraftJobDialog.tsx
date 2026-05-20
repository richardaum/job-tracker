"use client";

import { tryRun } from "@job-tracker/try-run";
import { Checkbox, cn, ConfirmDialog, Text } from "@job-tracker/ui";
import React, { useState } from "react";

import { DraftJobsListDocument, useDeleteDraftJobMutation } from "@/gql/hooks";

interface DeleteDraftJobDialogProps {
  trigger?: React.ReactElement;
  draftId: string;
  draftSummary: string;
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
  hasLinkedJob = false,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteDraftJobDialogProps) {
  const [deleteLinkedJob, setDeleteLinkedJob] = useState(false);
  const [deleteDraftJob] = useDeleteDraftJobMutation({
    refetchQueries: [{ query: DraftJobsListDocument }],
    awaitRefetchQueries: true,
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete draft"
      description={`Are you sure you want to delete this draft (${draftSummary})? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDeleteLinkedJob(false);
        }
        onOpenChange?.(nextOpen);
      }}
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteDraftJob({ variables: { id: draftId, deleteLinkedJob } }),
        );
        if (err) {
          onError?.("Could not delete the draft. Please try again.");
          throw err;
        }
        onSuccess?.("Draft was deleted.");
      }}
    >
      {hasLinkedJob ? (
        <label
          className={cn(
            "mt-3 flex cursor-pointer items-center gap-2 rounded-sm border border-border-subtle bg-bg-surface-subtle p-3",
          )}
        >
          <Checkbox
            checked={deleteLinkedJob}
            onCheckedChange={setDeleteLinkedJob}
            size="sm"
          />
          <Text as="span" size="sm">
            Also remove all jobs created from this draft.
          </Text>
        </label>
      ) : null}
    </ConfirmDialog>
  );
}
