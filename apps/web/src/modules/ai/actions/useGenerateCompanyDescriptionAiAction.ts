"use client";

import { useMemo } from "react";

import { useGenerateCompanyDescriptionLazyQuery } from "@/gql/hooks";
import { type TipTapAiAction } from "@/modules/ai/editor/tiptap-ai-actions";

interface UseGenerateCompanyDescriptionAiActionArgs {
  companyName: string;
  disabled?: boolean;
  onError?: (message: string) => void;
}

export function useGenerateCompanyDescriptionAiAction({
  companyName,
  disabled = false,
  onError,
}: UseGenerateCompanyDescriptionAiActionArgs): TipTapAiAction {
  const [generateCompanyDescription, { loading }] = useGenerateCompanyDescriptionLazyQuery({ fetchPolicy: "no-cache" });

  return useMemo(
    () => ({
      id: "generateCompanyDescription",
      label: "Search on web",
      kind: "generate",
      disabled: disabled || !companyName.trim(),
      isLoading: loading,
      run: async () => {
        const result = await generateCompanyDescription({ variables: { companyName: companyName.trim() } });
        return result.data?.generateCompanyDescription ?? "";
      },
      onError: () => {
        onError?.("Could not generate company description. Please try again.");
      },
    }),
    [companyName, disabled, generateCompanyDescription, loading, onError],
  );
}
