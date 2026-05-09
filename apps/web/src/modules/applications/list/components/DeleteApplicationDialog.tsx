"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

import {
  ApplicationsDocument,
  DeleteApplicationDocument,
  useDeleteApplicationMutation,
} from "@/gql/hooks";
import { removeDeletedEntityFromListCache } from "@/modules/applications/shared/utils/apolloDeleteCache";

interface DeleteApplicationDialogProps {
  trigger: React.ReactElement;
  applicationId: string;
  applicationTitle: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteApplicationDialog({
  trigger,
  applicationId,
  applicationTitle,
  open,
  onOpenChange,
  onSuccess,
  onError,
}: DeleteApplicationDialogProps) {
  const [deleteApplication] = useDeleteApplicationMutation({
    update(cache, { data }) {
      removeDeletedEntityFromListCache(cache, {
        mutationData: data,
        mutation: DeleteApplicationDocument,
        query: ApplicationsDocument,
      });
    },
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete application"
      description={`Are you sure you want to delete "${applicationTitle}"? This cannot be undone.`}
      confirmLabel="Delete"
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteApplication({ variables: { id: applicationId } }),
        );
        if (err) {
          onError?.("Could not delete the application. Please try again.");
          throw err;
        }
        onSuccess?.(`"${applicationTitle}" was deleted.`);
      }}
    />
  );
}
