"use client";

import { useMemo } from "react";

import { useJobNoteAiGenerator } from "@/modules/ai/actions/useJobNoteAiGenerator";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseImproveJobNoteAiActionArgs {
  jobId: string;
  disabled?: boolean;
}

export function useImproveJobNoteAiAction({
  jobId,
  disabled = false,
}: UseImproveJobNoteAiActionArgs): TipTapAiAction {
  const { generateNote, isLoading } = useJobNoteAiGenerator({ jobId });

  return useMemo(
    () => ({
      id: "improveNote",
      label: "Improve note",
      kind: "generate",
      disabled,
      isLoading,
      run: async ({ documentText }) => generateNote(documentText),
    }),
    [disabled, generateNote, isLoading],
  );
}
