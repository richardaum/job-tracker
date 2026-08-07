"use client";

import { EMPTY_TIPTAP_DOC, normalizeTipTapDocument } from "@job-tracker/tiptap";
import { cn, Stack } from "@job-tracker/ui";
import { useState } from "react";

import { type AutoSaveStatus, useAutoSave } from "@/hooks/useAutoSave";
import { useRestructureJobDescriptionAiAction } from "@/modules/ai/actions/useRestructureJobDescriptionAiAction";

import { TipTapEditor } from "./TipTapEditor";

type DescriptionEditorProps = {
  initialDescription: string | null | undefined;
  onSave: (description: string) => Promise<void>;
  onError: () => void;
};

export function DescriptionEditor({ initialDescription, onSave, onError }: DescriptionEditorProps) {
  const [description, setDescription] = useState<string>(normalizeTipTapDocument(initialDescription));
  const restructureDescriptionAction = useRestructureJobDescriptionAiAction();
  const { autoSaveStatus } = useAutoSave({ value: description, save: onSave, onError });

  return (
    <Stack gap="sm" className={cn("h-full min-h-0")}>
      <div className={cn("flex-1 min-h-0")} data-welcome-tour-step="job-description-editor">
        <TipTapEditor
          id="details-description"
          value={description}
          onChange={(nextValue) => setDescription(nextValue || EMPTY_TIPTAP_DOC)}
          placeholder="Add role context, stack, interview notes..."
          autofocus="end"
          fillHeight
          aiActions={[restructureDescriptionAction]}
        />
      </div>
      <p className={cn("text-right text-xs text-text-muted")} aria-live="polite">
        {getAutoSaveStatusLabel(autoSaveStatus)}
      </p>
    </Stack>
  );
}

function getAutoSaveStatusLabel(status: AutoSaveStatus) {
  switch (status) {
    case "pending":
      return "Unsaved changes";
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Changes not saved";
    case "idle":
      return null;
  }
}
