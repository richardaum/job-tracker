"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

import {
  SourcesForSourceProfileDocument,
  useDeleteSourceTemplateMutation,
} from "@/gql/hooks";

type DeleteSourceDialogProps = {
  trigger: React.ReactElement;
  templateId: string;
  sourceProfileId: string;
  onDeleted?: (templateId: string) => void;
};

export function DeleteSourceDialog({
  trigger,
  templateId,
  sourceProfileId,
  onDeleted,
}: DeleteSourceDialogProps) {
  const refetchSources =
    sourceProfileId !== ""
      ? {
          refetchQueries: [
            {
              query: SourcesForSourceProfileDocument,
              variables: { sourceProfileId },
            },
          ],
        }
      : {};
  const [deleteSource] = useDeleteSourceTemplateMutation(refetchSources);

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete source?"
      description="This removes the source and all of its runs. Applications linked to those runs lose that link. You cannot undo this."
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
