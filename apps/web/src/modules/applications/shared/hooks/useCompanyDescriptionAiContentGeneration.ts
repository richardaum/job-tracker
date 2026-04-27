"use client";

import { useState } from "react";
import { useGenerateCompanyDescriptionMutation } from "@/gql/hooks";

type UseCompanyDescriptionAiContentGenerationArgs = {
  companyName: string;
  disabled?: boolean;
  onError?: (message: string) => void;
};

type CompanyDescriptionAiContentGeneration = {
  buttonLabel: string;
  isGenerating: boolean;
  disabled: boolean;
  onGenerateContent: () => Promise<string>;
  onError: () => void;
};

export function useCompanyDescriptionAiContentGeneration({
  companyName,
  disabled = false,
  onError,
}: UseCompanyDescriptionAiContentGenerationArgs): CompanyDescriptionAiContentGeneration {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateCompanyDescription] = useGenerateCompanyDescriptionMutation();

  return {
    buttonLabel: "AI",
    isGenerating,
    disabled: !companyName.trim() || disabled,
    onGenerateContent: async () => {
      setIsGenerating(true);
      try {
        const result = await generateCompanyDescription({
          variables: { companyName: companyName.trim() },
        });
        return result.data?.generateCompanyDescription ?? "";
      } finally {
        setIsGenerating(false);
      }
    },
    onError: () => {
      onError?.("Could not generate company description. Please try again.");
    },
  };
}
