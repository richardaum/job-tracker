"use client";

import { useState } from "react";
import { useGenerateApplicationNoteWithAiMutation } from "@/gql/hooks";
import { tipTapToPlainText } from "@/modules/applications/shared/utils/tiptap";

type UseNotesAiContentGenerationArgs = {
  applicationId: string;
  noteContent: string;
  disabled?: boolean;
};

type NotesAiContentGeneration = {
  buttonLabel: string;
  isGenerating: boolean;
  disabled: boolean;
  onGenerateContent: () => Promise<string>;
};

export function useNotesAiContentGeneration({
  applicationId,
  noteContent,
  disabled = false,
}: UseNotesAiContentGenerationArgs): NotesAiContentGeneration {
  const [generatingNote, setGeneratingNote] = useState(false);
  const [generateApplicationNoteWithAi] =
    useGenerateApplicationNoteWithAiMutation();
  const noteText = tipTapToPlainText(noteContent).trim();

  return {
    buttonLabel: "AI",
    isGenerating: generatingNote,
    disabled: !noteText || disabled,
    onGenerateContent: async () => {
      setGeneratingNote(true);
      try {
        const result = await generateApplicationNoteWithAi({
          variables: { applicationId, note: noteText },
        });
        return result.data?.generateApplicationNoteWithAI ?? noteContent;
      } finally {
        setGeneratingNote(false);
      }
    },
  };
}
