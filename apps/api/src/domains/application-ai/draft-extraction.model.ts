import { draftExtractionFieldDefs } from "./draft-extraction.schema";
import type {
  DraftExtractionFieldSpec,
  DraftExtractionSchemaKey,
} from "./draft-extraction.types";

/** Canonical ordered field specs (matches Zod keys). */
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

/**
 * Formats `fields` for the system prompt.
 * Includes full schema/type guidance so the model has a stable global contract.
 */
export function formatSystemPromptFields(
  specs: readonly DraftExtractionFieldSpec[],
): string {
  return specs
    .map((spec) => {
      const obligation = spec.required ? "Required" : "Optional";
      return `   - **${spec.key}**: ${spec.kind} (${obligation}). ${spec.hint}`;
    })
    .join("\n");
}

/**
 * Formats `fields` for the user prompt.
 * Repeats the same field contract in compact form next to request-specific content.
 */
export function formatUserPromptFields(
  specs: readonly DraftExtractionFieldSpec[],
): string {
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
