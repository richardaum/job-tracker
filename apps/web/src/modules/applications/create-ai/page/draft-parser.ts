import {
  type CreateApplicationInput,
  type GenerateApplicationDraftWithAiQuery,
  type SalaryPeriod,
} from "@/gql/hooks";

export type AiDraftFormState = {
  title: string;
  company: string;
  description: string;
  url: string;
  salaryMinCents: string;
  salaryMaxCents: string;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod | "none";
  tagsText: string;
  noteContentsText: string;
};

type GeneratedDraft =
  GenerateApplicationDraftWithAiQuery["generateApplicationDraftWithAI"];

export function formatGeneratedDraftToFormState(
  generated: GeneratedDraft,
): AiDraftFormState {
  return {
    title: generated.title ?? "",
    company: generated.company ?? "",
    description: generated.description ?? "",
    url: generated.url ?? "",
    salaryMinCents:
      generated.salaryMinCents === null ||
      generated.salaryMinCents === undefined
        ? ""
        : String(generated.salaryMinCents),
    salaryMaxCents:
      generated.salaryMaxCents === null ||
      generated.salaryMaxCents === undefined
        ? ""
        : String(generated.salaryMaxCents),
    salaryCurrency: generated.salaryCurrency ?? "",
    salaryPeriod: generated.salaryPeriod ?? "none",
    tagsText: generated.tags.join(", "),
    noteContentsText: generated.noteContents.join("\n"),
  };
}

export function toTipTapDocument(value: string): string {
  return JSON.stringify({
    type: "doc",
    content: value.trim()
      ? [{ type: "paragraph", content: [{ type: "text", text: value.trim() }] }]
      : [],
  });
}

function isTipTapDocumentJsonString(value: string): boolean {
  try {
    const parsed = JSON.parse(value) as { type?: unknown; content?: unknown };
    return parsed.type === "doc" && Array.isArray(parsed.content);
  } catch {
    return false;
  }
}

function normalizeDraftDescriptionToTipTap(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return toTipTapDocument("");
  if (isTipTapDocumentJsonString(trimmed)) return trimmed;
  return toTipTapDocument(trimmed);
}

export function parseCreateApplicationInput(
  draft: AiDraftFormState,
): CreateApplicationInput {
  return {
    title: draft.title.trim(),
    company: draft.company.trim(),
    description: normalizeDraftDescriptionToTipTap(draft.description),
    url: draft.url.trim() || null,
    salaryMinCents: draft.salaryMinCents.trim()
      ? Number.parseInt(draft.salaryMinCents.trim(), 10)
      : null,
    salaryMaxCents: draft.salaryMaxCents.trim()
      ? Number.parseInt(draft.salaryMaxCents.trim(), 10)
      : null,
    salaryCurrency: draft.salaryCurrency.trim()
      ? draft.salaryCurrency.trim().toUpperCase()
      : null,
    salaryPeriod: draft.salaryPeriod === "none" ? null : draft.salaryPeriod,
    tags: draft.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

export function parseDraftNoteContents(draft: AiDraftFormState): string[] {
  return draft.noteContentsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}
