"use client";

import { tryRun } from "@job-tracker/try-run";
import { ConfirmDialog } from "@job-tracker/ui";
import React from "react";

import {
  ImportTemplatesForImporterDocument,
  useDeleteImportTemplateMutation,
} from "@/gql/hooks";

type DeleteImportTemplateDialogProps = {
  trigger: React.ReactElement;
  templateId: string;
  importerId: string;
  onDeleted?: (templateId: string) => void;
};

export function DeleteImportTemplateDialog({
  trigger,
  templateId,
  importerId,
  onDeleted,
}: DeleteImportTemplateDialogProps) {
  const refetchTemplates =
    importerId !== ""
      ? {
          refetchQueries: [
            {
              query: ImportTemplatesForImporterDocument,
              variables: { importerId },
            },
          ],
        }
      : {};
  const [deleteImportTemplate] =
    useDeleteImportTemplateMutation(refetchTemplates);

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete import template?"
      description="This removes the template and all of its import runs. Applications linked to those runs lose that link. You cannot undo this."
      confirmLabel="Delete"
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteImportTemplate({ variables: { id: templateId } }),
        );
        if (err) throw err;
        onDeleted?.(templateId);
      }}
    />
  );
}
