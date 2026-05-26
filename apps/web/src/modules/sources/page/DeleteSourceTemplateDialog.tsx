"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import { useRouter } from "next/navigation";
import React from "react";

import {
  SourceProfilesListAllDocument,
  SourcesForSourceProfileDocument,
  useDeleteSourceTemplateMutation,
} from "@/gql/hooks";

type DeleteSourceTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  sourceProfileId: string;
};

export function DeleteSourceTemplateDialog({
  open,
  onOpenChange,
  templateId,
  sourceProfileId,
}: DeleteSourceTemplateDialogProps) {
  const router = useRouter();
  const [deleteSourceTemplate] = useDeleteSourceTemplateMutation();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete template?"
      description="This permanently removes the source template and all its runs. You cannot undo this."
      confirmLabel="Delete"
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteSourceTemplate({
            variables: { id: templateId },
            refetchQueries: [
              { query: SourceProfilesListAllDocument },
              {
                query: SourcesForSourceProfileDocument,
                variables: { sourceProfileId },
              },
            ],
            awaitRefetchQueries: true,
          }),
        );
        if (err) throw err;
        onOpenChange(false);
        router.push(`/sources/profile/${sourceProfileId}`);
      }}
    />
  );
}
