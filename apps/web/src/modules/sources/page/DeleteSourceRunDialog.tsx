"use client";

import { tryRun } from "@job-tracker/try-run";
import { Checkbox, cn, ConfirmDialog, Stack, Text } from "@job-tracker/ui";
import { useId, useState } from "react";
import type { ReactElement } from "react";

import { JobsDocument, SourceTemplateDocument, useDeleteSourceRunMutation } from "@/gql/hooks";

type DeleteSourceRunDialogProps = {
  trigger: ReactElement;
  runId: string;
  templateId: string;
  runLabel: string;
  onDeleted?: (runId: string) => void;
};

export function DeleteSourceRunDialog({ trigger, runId, templateId, runLabel, onDeleted }: DeleteSourceRunDialogProps) {
  const checkboxId = useId();
  const [deleteJobs, setDeleteJobs] = useState(false);
  const [deleteSourceRun] = useDeleteSourceRunMutation();

  function handleOpenChange(open: boolean) {
    if (!open) {
      setDeleteJobs(false);
    }
  }

  return (
    <ConfirmDialog
      trigger={trigger}
      title="Delete run?"
      description={`This removes ${runLabel} from history. You cannot undo this.`}
      confirmLabel="Delete"
      onOpenChange={handleOpenChange}
      onConfirm={async () => {
        const [err] = await tryRun(
          deleteSourceRun({
            variables: { id: runId, deleteJobs },
            refetchQueries: [
              { query: SourceTemplateDocument, variables: { id: templateId } },
              ...(deleteJobs ? [{ query: JobsDocument }] : []),
              "SourceTemplatesAll",
            ],
            awaitRefetchQueries: true,
          }),
        );
        if (err) throw err;
        onDeleted?.(runId);
      }}
    >
      <Stack gap="sm" className={cn("pt-1")}>
        <Text size="sm" color="secondary">
          {deleteJobs
            ? "Jobs imported by this run will be deleted permanently."
            : "Jobs imported by this run stay in your list but lose the source run link."}
        </Text>
        <label htmlFor={checkboxId} className={cn("flex cursor-pointer items-start gap-2")}>
          <Checkbox id={checkboxId} checked={deleteJobs} onCheckedChange={setDeleteJobs} />
          <Text size="sm">Also delete jobs imported by this run</Text>
        </label>
      </Stack>
    </ConfirmDialog>
  );
}
