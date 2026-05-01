"use client";

import { useMemo } from "react";

import { useApplicationNoteAiGenerator } from "@/modules/ai/actions/useApplicationNoteAiGenerator";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseImproveApplicationNoteAiActionArgs {
  applicationId: string;
  disabled?: boolean;
}

export function useImproveApplicationNoteAiAction({
  applicationId,
  disabled = false,
}: UseImproveApplicationNoteAiActionArgs): TipTapAiAction {
  const { generateNote, isLoading } = useApplicationNoteAiGenerator({
    applicationId,
  });

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
