"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

import { useDeleteSourceTemplateMutation } from "@/gql/hooks";

type DeleteSourceDialogProps = {
  trigger: React.ReactElement;
  templateId: string;
  onDeleted?: (templateId: string) => void;
};

export function DeleteSourceDialog({
  trigger,
  templateId,
  onDeleted,
}: DeleteSourceDialogProps) {
  const [deleteSource] = useDeleteSourceTemplateMutation({
    refetchQueries: ["Plans", "SourceTemplatesAll"],
  });

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete template?"
      description="This removes the template and all of its runs. Applications linked to those runs lose that link. You cannot undo this."
      confirmLabel="Delete"
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteSource({ variables: { id: templateId } }),
        );
        if (err) throw err;
        onDeleted?.(templateId);
      }}
    />
  );
}
