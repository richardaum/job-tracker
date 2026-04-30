"use client";

import { useMemo } from "react";
import { useRewriteApplicationTextWithAiLazyQuery } from "@/gql/hooks";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseRewriteTextAiActionArgs {
  applicationId: string;
  disabled?: boolean;
}

export function useRewriteTextAiAction({
  applicationId,
  disabled = false,
}: UseRewriteTextAiActionArgs): TipTapAiAction {
  const [rewriteApplicationTextWithAi, { loading }] =
    useRewriteApplicationTextWithAiLazyQuery({ fetchPolicy: "no-cache" });

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
        const result = await rewriteApplicationTextWithAi({
          variables: { applicationId, text },
        });
        return result.data?.rewriteApplicationTextWithAI ?? text;
      },
    }),
    [applicationId, disabled, loading, rewriteApplicationTextWithAi],
  );
}
