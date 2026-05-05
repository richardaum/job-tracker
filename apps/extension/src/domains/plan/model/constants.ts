/** Upper bounds for plan JSON parsing — wired in schema.ts only. */
export const LIMITS = {
  /** Max concurrent detail tabs when collecting jobs (`parallelDetailsTabs`). */
  parallelDetailsTabs: 16,
  attrName: 128,
  fieldKey: 128,
  listFields: 64,
  planSteps: 256,
  regexFlags: 16,
  regexPattern: 2_048,
  selector: 4_096,
  stepId: 256,
} as const;
