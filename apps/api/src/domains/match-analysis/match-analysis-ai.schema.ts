import { RequirementTypeEnum } from "@api/database/entities/match-analysis.entity";
import { z } from "zod";

export const resumeMatchItemSchema = z.object({
  requirement: z.string(),
  type: z.enum(Object.values(RequirementTypeEnum) as [string, ...string[]]),
  verdict: z.enum(["fit", "gap", "unclear"]),
  jdQuote: z.string(),
  sourceQuotes: z.array(z.string()),
  suggestion: z.string().nullable(),
});

export const resumeMatchAnalysisSchema = z.object({
  items: z.array(resumeMatchItemSchema),
});

export type ResumeMatchItemParsed = z.infer<typeof resumeMatchItemSchema>;

export const preferenceMatchItemSchema = z.object({
  requirement: z.string(),
  type: z.enum(Object.values(RequirementTypeEnum) as [string, ...string[]]),
  verdict: z.enum(["fit", "gap", "unclear"]),
  jdQuote: z.string(),
  suggestion: z.string().nullable(),
});

export const preferenceMatchAnalysisSchema = z.object({
  items: z.array(preferenceMatchItemSchema),
});

export type PreferenceMatchItemParsed = z.infer<
  typeof preferenceMatchItemSchema
>;
