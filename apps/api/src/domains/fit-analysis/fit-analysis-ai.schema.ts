import { RequirementTypeEnum } from "@api/database/entities/fit-analysis.entity";
import { FitVerdictEnum } from "@api/domains/fit-analysis/fit-verdict.enum";
import { z } from "zod";

export const resumeFitItemSchema = z.object({
  requirement: z.string(),
  type: z.enum(Object.values(RequirementTypeEnum) as [string, ...string[]]),
  verdict: z.enum(FitVerdictEnum),
  jdQuote: z.string(),
  sourceQuotes: z.array(z.string()),
  suggestion: z.string().nullable(),
});

export const resumeFitAnalysisSchema = z.object({
  items: z.array(resumeFitItemSchema),
});

export type ResumeFitItemParsed = z.infer<typeof resumeFitItemSchema>;

export const preferenceFitItemSchema = z.object({
  requirement: z.string(),
  type: z.enum(Object.values(RequirementTypeEnum) as [string, ...string[]]),
  verdict: z.enum(FitVerdictEnum),
  jdQuote: z.string(),
  suggestion: z.string().nullable(),
});

export const preferenceFitAnalysisSchema = z.object({
  items: z.array(preferenceFitItemSchema),
});

export type PreferenceFitItemParsed = z.infer<typeof preferenceFitItemSchema>;
