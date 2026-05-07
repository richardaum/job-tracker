"use client";

import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

import {
  DraftApplicationsListDocument,
  useDeleteDraftApplicationMutation,
} from "@/gql/hooks";

interface DeleteDraftApplicationDialogProps {
  trigger: React.ReactElement;
  draftId: string;
  draftSummary: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteDraftApplicationDialog({
  trigger,
  draftId,
  draftSummary,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteDraftApplicationDialogProps) {
  const [deleteDraftApplication] = useDeleteDraftApplicationMutation({
    refetchQueries: [{ query: DraftApplicationsListDocument }],
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
        try {
          await deleteDraftApplication({ variables: { id: draftId } });
          onSuccess?.("Draft was deleted.");
        } catch (err) {
          onError?.("Could not delete the draft. Please try again.");
          throw err;
        }
      }}
    />
  );
}
