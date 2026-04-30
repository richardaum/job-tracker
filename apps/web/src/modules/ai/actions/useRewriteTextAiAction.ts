"use client";

import { useMemo } from "react";
import { useRewriteTextWithAiLazyQuery } from "@/gql/hooks";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseRewriteTextAiActionArgs {
  disabled?: boolean;
}

export function useRewriteTextAiAction({
  disabled = false,
}: UseRewriteTextAiActionArgs): TipTapAiAction {
  const [rewriteTextWithAi, { loading }] = useRewriteTextWithAiLazyQuery({
    fetchPolicy: "no-cache",
  });

  return useMemo(
    () => ({
      id: "rewriteText",
      label: "Rewrite text",
      kind: "rewrite",
      requiresSourceText: true,
      disabled,
      isLoading: loading,
      run: async ({ sourceText }) => {
        const text = sourceText.trim();
        const result = await rewriteTextWithAi({ variables: { text } });
        return result.data?.rewriteTextWithAI ?? text;
      },
    }),
    [disabled, loading, rewriteTextWithAi],
  );
}
