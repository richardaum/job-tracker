import { z } from "zod";

const salaryPeriod = z.enum(["year", "month", "hour"]).nullable();

export const draftExtractionFieldDefs = {
  title: {
    schema: z.string(),
    required: true,
    kind: "string",
    hint: "Job or role title (plain text).",
  },
  company: {
    schema: z.string(),
    required: true,
    kind: "string",
    hint: "Employer or company name (plain text).",
  },
  url: {
    schema: z.string().nullable(),
    required: true,
    kind: "string | null",
    hint: "Canonical job posting URL when identifiable; otherwise null.",
  },
  description: {
    schema: z.string(),
    required: true,
    kind: 'TipTap document JSON string {"type":"doc","content":[...]}',
    hint: "Build from the posting text; use paragraphs/lists.",
  },
  salary: {
    schema: z.object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      currency: z.string().nullable(),
      period: salaryPeriod,
    }),
    required: true,
    kind: '{ min: number|null, max: number|null, currency: string|null, period: "year"|"month"|"hour"|null }',
    hint: "Numbers as in the posting (e.g. 5000.00). Use null for unknown scalar fields. Do not recalculate.",
  },
  tags: {
    schema: z.array(z.string()).default([]),
    required: false,
    kind: "string[]",
    hint: "Skills, stack, seniority labels. Omit or use [] when none.",
  },
} as const;

export const draftExtractionModelSchema = z.object({
  title: draftExtractionFieldDefs.title.schema,
  company: draftExtractionFieldDefs.company.schema,
  url: draftExtractionFieldDefs.url.schema,
  description: draftExtractionFieldDefs.description.schema,
  salary: draftExtractionFieldDefs.salary.schema,
  tags: draftExtractionFieldDefs.tags.schema,
});
