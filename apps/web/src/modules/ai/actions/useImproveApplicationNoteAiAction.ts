"use client";

import { useMemo } from "react";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseImproveApplicationNoteAiActionArgs {
  disabled?: boolean;
  isLoading: boolean;
  generateNote: (source: string) => Promise<string>;
}

export function useImproveApplicationNoteAiAction({
  disabled = false,
  isLoading,
  generateNote,
}: UseImproveApplicationNoteAiActionArgs): TipTapAiAction {
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
