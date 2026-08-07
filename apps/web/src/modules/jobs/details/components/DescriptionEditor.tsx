"use client";

import { EMPTY_TIPTAP_DOC, normalizeTipTapDocument, tipTapToPlainText } from "@job-tracker/tiptap";
import { tryRun } from "@job-tracker/try-run";
import { Button, cn, Stack } from "@job-tracker/ui";
import { useState } from "react";

import { JobDocument, JobsDocument, useUpdateJobMutation } from "@/gql/hooks";
import { useRestructureJobDescriptionAiAction } from "@/modules/ai/actions/useRestructureJobDescriptionAiAction";

import { TipTapEditor } from "./TipTapEditor";

type DescriptionEditorProps = {
  jobId: string;
  initialDescription: string | null | undefined;
  onSuccess: () => void;
  onError: () => void;
};

export function DescriptionEditor({ jobId, initialDescription, onSuccess, onError }: DescriptionEditorProps) {
  const [description, setDescription] = useState<string>(normalizeTipTapDocument(initialDescription));
  const restructureDescriptionAction = useRestructureJobDescriptionAiAction();
  const [updateJob, { loading: saving }] = useUpdateJobMutation({
    refetchQueries: [{ query: JobDocument, variables: { id: jobId } }, { query: JobsDocument }],
  });

  async function handleSaveDescription() {
    const nextDescription = tipTapToPlainText(description).trim().length > 0 ? description : null;

    const [error] = await tryRun(updateJob({ variables: { id: jobId, input: { description: nextDescription } } }));
    if (error) {
      onError();
      return;
    }
    onSuccess();
  }

  return (
    <Stack gap="sm" className={cn("h-full min-h-0")}>
      <div
        className={cn("flex-1 min-h-0")}
        data-welcome-tour-step={jobId === "welcome-tour-job" ? "job-description-editor" : undefined}
      >
        <TipTapEditor
          id="details-description"
          value={description}
          onChange={(nextValue) => setDescription(nextValue || EMPTY_TIPTAP_DOC)}
          placeholder="Add role context, stack, interview notes..."
          disabled={saving}
          autofocus="end"
          fillHeight
          aiActions={[restructureDescriptionAction]}
        />
      </div>
      <div className={cn("flex justify-end")}>
        <Button intent="primary" size="md" onClick={handleSaveDescription} state={saving ? "loading" : "default"}>
          Save description
        </Button>
      </div>
    </Stack>
  );
}
