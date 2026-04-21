"use client";

import React, { useState } from "react";
import { Button, Dialog, Stack } from "@job-tracker/ui";
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
  const [open, setOpen] = useState(false);

  const [deleteApplication, { loading }] = useDeleteApplicationMutation({
    refetchQueries: [{ query: ApplicationsDocument }],
  });

  async function handleDelete() {
    try {
      await deleteApplication({ variables: { id: applicationId } });
      onSuccess?.(`"${applicationTitle}" was deleted.`);
      setOpen(false);
    } catch {
      onError?.("Could not delete the application. Please try again.");
    }
  }

  const footer = (
    <Stack direction="row" gap="inline" justify="end">
      <Button
        intent="secondary"
        size="sm"
        onClick={() => setOpen(false)}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button
        intent="destructive"
        size="sm"
        state={loading ? "loading" : "default"}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </Stack>
  );

  return (
    <Dialog
      trigger={trigger}
      title="Delete application"
      description={`Are you sure you want to delete "${applicationTitle}"? This cannot be undone.`}
      footer={footer}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
