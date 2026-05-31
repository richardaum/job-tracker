"use client";

import { tryRun } from "@job-tracker/try-run";
import { Checkbox, cn, ConfirmDialog, Stack, Text } from "@job-tracker/ui";
import React, { useId, useState } from "react";

import {
  SourceTemplateDocument,
  SourceTemplateQuery,
  SourceTemplatesAllDocument,
  SourceTemplatesAllQuery,
  useClearSourceTemplateRunsMutation,
} from "@/gql/hooks";

type ClearSourceRunsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
};

export function ClearSourceRunsDialog({
  open,
  onOpenChange,
  templateId,
}: ClearSourceRunsDialogProps) {
  const checkboxId = useId();
  const [deleteJobs, setDeleteJobs] = useState(false);
  const [clearRuns] = useClearSourceTemplateRunsMutation();

  function handleOpenChange(open: boolean) {
    if (!open) {
      setDeleteJobs(false);
    }
    onOpenChange(open);
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Remove all runs?"
      description="This removes every run for this source. You cannot undo this."
      confirmLabel="Remove all"
      onConfirm={async () => {
        const [err] = await tryRun(
          clearRuns({
            variables: { templateId, deleteJobs },
            update: (cache) => {
              const template = cache.readQuery<SourceTemplateQuery>({
                query: SourceTemplateDocument,
                variables: { id: templateId },
              });
              if (template?.sourceTemplate) {
                cache.writeQuery({
                  query: SourceTemplateDocument,
                  variables: { id: templateId },
                  data: {
                    ...template,
                    sourceTemplate: { ...template.sourceTemplate, runs: [] },
                  },
                });
              }

              const all = cache.readQuery<SourceTemplatesAllQuery>({
                query: SourceTemplatesAllDocument,
              });
              if (all?.sourceTemplates) {
                cache.writeQuery({
                  query: SourceTemplatesAllDocument,
                  data: {
                    ...all,
                    sourceTemplates: all.sourceTemplates.map((t) =>
                      t.id === templateId ? { ...t, runs: [] } : t,
                    ),
                  },
                });
              }
            },
          }),
        );
        if (err) throw err;
      }}
    >
      <Stack gap="sm" className={cn("pt-1")}>
        <Text size="sm" color="secondary">
          {deleteJobs
            ? "Jobs imported by these runs will be deleted permanently."
            : "Jobs imported by these runs stay in your list but lose the source run link."}
        </Text>
        <label htmlFor={checkboxId} className={cn("flex cursor-pointer items-start gap-2")}>
          <Checkbox id={checkboxId} checked={deleteJobs} onCheckedChange={setDeleteJobs} />
          <Text size="sm">Also delete jobs imported by these runs</Text>
        </label>
      </Stack>
    </ConfirmDialog>
  );
}
