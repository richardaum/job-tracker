import { draftExtractionFieldDefs } from "./draft-extraction.schema";
import type { DraftExtractionFieldSpec, DraftExtractionSchemaKey } from "./draft-extraction.types";

export const DRAFT_EXTRACTION_FIELD_SPECS: DraftExtractionFieldSpec[] = (
  Object.entries(draftExtractionFieldDefs) as [
    DraftExtractionSchemaKey,
    (typeof draftExtractionFieldDefs)[DraftExtractionSchemaKey],
  ][]
).map(([key, def]) => ({
  key,
  required: def.required,
  kind: def.kind,
  hint: def.hint,
}));

export function formatSystemPromptFields(specs: readonly DraftExtractionFieldSpec[]): string {
  return specs
    .map((spec) => {
      const obligation = spec.required ? "Required" : "Optional";
      return `   - **${spec.key}**: ${spec.kind} (${obligation}). ${spec.hint}`;
    })
    .join("\n");
}

export function formatUserPromptFields(specs: readonly DraftExtractionFieldSpec[]): string {
  if (specs.length === 0) {
    return "- none";
  }
  return specs
    .map((spec) => {
      const obligation = spec.required ? "Required" : "Optional";
      return `- ${spec.key} (${obligation}): ${spec.kind} — ${spec.hint}`;
    })
    .join("\n");
}
