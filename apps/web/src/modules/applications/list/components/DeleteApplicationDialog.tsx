"use client";

import React from "react";
import { ConfirmDialog } from "@job-tracker/ui";
import {
  useDeleteApplicationMutation,
  ApplicationsDocument,
} from "@/gql/hooks";

interface DeleteApplicationDialogProps {
  trigger: React.ReactElement;
  applicationId: string;
  applicationTitle: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function DeleteApplicationDialog({
  trigger,
  applicationId,
  applicationTitle,
  onSuccess,
  onError,
}: DeleteApplicationDialogProps) {
  const [deleteApplication] = useDeleteApplicationMutation({
    refetchQueries: [{ query: ApplicationsDocument }],
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete application"
      description={`Are you sure you want to delete "${applicationTitle}"? This cannot be undone.`}
      confirmLabel="Delete"
      onConfirm={async () => {
        try {
          await deleteApplication({ variables: { id: applicationId } });
          onSuccess?.(`"${applicationTitle}" was deleted.`);
        } catch (err) {
          onError?.("Could not delete the application. Please try again.");
          throw err;
        }
      }}
    />
  );
}
