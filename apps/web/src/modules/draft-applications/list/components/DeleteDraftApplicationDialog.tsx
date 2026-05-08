"use client";

import { Checkbox, cn, ConfirmDialog, Text } from "@job-tracker/ui";
import React, { useState } from "react";

import {
  DraftApplicationsListDocument,
  useDeleteDraftApplicationMutation,
} from "@/gql/hooks";

interface DeleteDraftApplicationDialogProps {
  trigger: React.ReactElement;
  draftId: string;
  draftSummary: string;
  hasLinkedApplication?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteDraftApplicationDialog({
  trigger,
  draftId,
  draftSummary,
  hasLinkedApplication = false,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteDraftApplicationDialogProps) {
  const [deleteLinkedApplication, setDeleteLinkedApplication] = useState(false);
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
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setDeleteLinkedApplication(false);
        }
        onOpenChange?.(nextOpen);
      }}
      onConfirm={async () => {
        try {
          await deleteDraftApplication({
            variables: { id: draftId, deleteLinkedApplication },
          });
          onSuccess?.("Draft was deleted.");
        } catch (err) {
          onError?.("Could not delete the draft. Please try again.");
          throw err;
        }
      }}
    >
      {hasLinkedApplication ? (
        <label
          className={cn(
            "mt-3 flex cursor-pointer items-center gap-2 rounded-sm border border-border-subtle bg-bg-surface-subtle p-3",
          )}
        >
          <Checkbox
            checked={deleteLinkedApplication}
            onCheckedChange={setDeleteLinkedApplication}
            size="sm"
          />
          <Text as="span" size="sm">
            Also remove all applications created from this draft.
          </Text>
        </label>
      ) : null}
    </ConfirmDialog>
  );
}
