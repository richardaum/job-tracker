import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

import { parseSalaryInnerTextForCreateJob } from "@/domains/dom/parse-salary-inner-text-for-job";
import type {
  PlanStepCollectJobsDetailsField,
  PlanStepCollectJobsSurfaceField,
} from "@/domains/plan/model/types";

/** Same extensions as the web app editor so scraped content maps to compatible JSON. */
const TIPTAP_EXTENSIONS = [StarterKit];

type CollectField =
  | PlanStepCollectJobsSurfaceField
  | PlanStepCollectJobsDetailsField;

/**
 * Transforms a validated raw string (or null/undefined) into the value stored on the job.
 */
export interface FieldFormatStrategy {
  apply(value: string | null | undefined, field: CollectField): unknown;
}

/** Returns the raw extracted value unchanged. */
export class PassthroughFieldFormatStrategy implements FieldFormatStrategy {
  apply(value: string | null | undefined, _field: CollectField) {
    return value;
  }
}

/** String snapshot → TipTap StarterKit document JSON (for the web editor). */
export class TiptapFieldFormatStrategy implements FieldFormatStrategy {
  apply(value: string | null | undefined, _field: CollectField): unknown {
    if (value == null) return value;
    if (typeof value !== "string") return value;
    return generateJSON(value, TIPTAP_EXTENSIONS);
  }
}

/** Parsed salary line → object matching {@link CreateJobInput} salary fields. */
export class SalaryFieldFormatStrategy implements FieldFormatStrategy {
  apply(value: string | null | undefined, _field: CollectField): unknown {
    if (value == null || typeof value !== "string" || value.trim() === "") {
      return null;
    }
    return parseSalaryInnerTextForCreateJob(value);
  }
}

/** Resolves the plan `format` hint to a strategy; missing format uses passthrough. */
export class FieldFormatStrategyPicker {
  constructor(
    private readonly passthrough: FieldFormatStrategy,
    private readonly byFormat: Readonly<Record<string, FieldFormatStrategy>>,
  ) {}

  pick(field: CollectField): FieldFormatStrategy {
    if (field.type !== "property" || !("format" in field)) {
      return this.passthrough;
    }
    const id = field.format;
    if (id == null) return this.passthrough;
    const strategy = this.byFormat[id];
    if (!strategy) {
      throw new Error(`Unknown field format "${id}"`);
    }
    return strategy;
  }
}

export function createDefaultFieldFormatStrategyPicker() {
  const passthrough = new PassthroughFieldFormatStrategy();
  return new FieldFormatStrategyPicker(passthrough, {
    tiptap: new TiptapFieldFormatStrategy(),
    salary: new SalaryFieldFormatStrategy(),
  });
}
