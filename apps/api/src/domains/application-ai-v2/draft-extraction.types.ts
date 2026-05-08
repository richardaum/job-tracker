import { z } from "zod";

import {
  draftExtractionFieldDefs,
  draftExtractionModelSchema,
} from "./draft-extraction.schema";

export type DraftExtractionModel = z.infer<typeof draftExtractionModelSchema>;
export type DraftExtractionSchemaKey = keyof typeof draftExtractionFieldDefs;

/** Single source for JSON shape in prompts: key, obligation, type + guidance. */
export type DraftExtractionFieldSpec = {
  key: DraftExtractionSchemaKey;
  /** If false, the model may omit the key; parser fills defaults. */
  required: boolean;
  /** Appears after `key:` (e.g. `string`, `TipTap JSON {"type":"doc",...}`). */
  kind: string;
  hint: string;
};
