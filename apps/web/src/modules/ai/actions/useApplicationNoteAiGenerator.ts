"use client";

import { useCallback } from "react";

import { useGenerateApplicationNoteWithAiLazyQuery } from "@/gql/hooks";

interface UseApplicationNoteAiGeneratorArgs {
  applicationId: string;
}

interface UseApplicationNoteAiGeneratorResult {
  isLoading: boolean;
  generateNote: (source: string) => Promise<string>;
}

export function useApplicationNoteAiGenerator({
  applicationId,
}: UseApplicationNoteAiGeneratorArgs): UseApplicationNoteAiGeneratorResult {
  const [generateApplicationNoteWithAi, { loading }] =
    useGenerateApplicationNoteWithAiLazyQuery({ fetchPolicy: "no-cache" });

  const generateNote = useCallback(
    async (source: string): Promise<string> => {
      const note = source.trim();
      const result = await generateApplicationNoteWithAi({
        variables: { applicationId, note },
      });

      return result.data?.generateApplicationNoteWithAI ?? note;
    },
    [applicationId, generateApplicationNoteWithAi],
  );

  return { isLoading: loading, generateNote };
}
