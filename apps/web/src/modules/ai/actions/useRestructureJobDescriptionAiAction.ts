"use client";

import { useMemo } from "react";
import { useRestructureJobDescriptionWithAiLazyQuery } from "@/gql/hooks";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseRestructureJobDescriptionAiActionArgs {
  disabled?: boolean;
  onError?: (message: string) => void;
}

export function useRestructureJobDescriptionAiAction({
  disabled = false,
  onError,
}: UseRestructureJobDescriptionAiActionArgs = {}): TipTapAiAction {
  const [restructureJobDescriptionWithAi, { loading }] =
    useRestructureJobDescriptionWithAiLazyQuery({ fetchPolicy: "no-cache" });

  return useMemo(
    () => ({
      id: "restructureJobDescription",
      label: "Restructure description",
      kind: "rewrite",
      requiresSourceText: true,
      disabled,
      isLoading: loading,
      run: async ({ sourceText }) => {
        const text = sourceText.trim();
        const result = await restructureJobDescriptionWithAi({
          variables: { text },
        });
        return result.data?.restructureJobDescriptionWithAI ?? text;
      },
      onError: () => {
        onError?.("Could not restructure the description. Please try again.");
      },
    }),
    [disabled, loading, onError, restructureJobDescriptionWithAi],
  );
}
