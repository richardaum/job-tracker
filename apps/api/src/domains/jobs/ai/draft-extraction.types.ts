import { z } from "zod";

import { draftExtractionFieldDefs, draftExtractionModelSchema } from "./draft-extraction.schema";

export type DraftExtractionModel = z.infer<typeof draftExtractionModelSchema>;
export type DraftExtractionSchemaKey = keyof typeof draftExtractionFieldDefs;

export type DraftExtractionFieldSpec = {
  key: DraftExtractionSchemaKey;
  required: boolean;
  kind: string;
  hint: string;
};
