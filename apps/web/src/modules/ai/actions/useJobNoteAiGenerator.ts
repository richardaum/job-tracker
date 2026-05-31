"use client";

import { useCallback } from "react";

import { useGenerateJobNoteWithAiLazyQuery } from "@/gql/hooks";

interface UseJobNoteAiGeneratorArgs {
  jobId: string;
}

interface UseJobNoteAiGeneratorResult {
  isLoading: boolean;
  generateNote: (source: string) => Promise<string>;
}

export function useJobNoteAiGenerator({
  jobId,
}: UseJobNoteAiGeneratorArgs): UseJobNoteAiGeneratorResult {
  const [generateJobNoteWithAi, { loading }] = useGenerateJobNoteWithAiLazyQuery({
    fetchPolicy: "no-cache",
  });

  const generateNote = useCallback(
    async (source: string): Promise<string> => {
      const note = source.trim();
      const result = await generateJobNoteWithAi({
        variables: { jobId, note },
      });

      return result.data?.generateJobNoteWithAI ?? note;
    },
    [jobId, generateJobNoteWithAi],
  );

  return { isLoading: loading, generateNote };
}
