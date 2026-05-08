import { captureSync } from "@job-tracker/async";
import { z } from "zod";

import { LIMITS } from "./constants";

const PlanStepIdSchema = z
  .string()
  .min(1)
  .max(LIMITS.stepId)
  .describe("Step id");

const CssSelectorSchema = z.string().min(1).max(LIMITS.selector);
const FieldValidationRegexSchema = z
  .object({
    pattern: z.string().min(1).max(LIMITS.regexPattern),
    flags: z.string().max(LIMITS.regexFlags).optional(),
  })
  .strict()
  .superRefine(({ pattern, flags }, ctx) => {
    const [regErr] = captureSync(() => {
      void new RegExp(pattern, flags);
    });
    if (regErr) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid validationRegex: pattern or flags are not valid",
      });
    }
  });

export const PlanStepCollectJobsSurfaceFieldSchema = z
  .discriminatedUnion("type", [
    z
      .object({
        key: z.string().min(1).max(LIMITS.fieldKey),
        selector: CssSelectorSchema,
        type: z.literal("attribute"),
        value: z.string().min(1).max(LIMITS.attrName),
        validationRegex: FieldValidationRegexSchema.optional(),
      })
      .strict(),
    z
      .object({
        key: z.string().min(1).max(LIMITS.fieldKey),
        selector: CssSelectorSchema,
        type: z.literal("property"),
        value: z.enum(["innerText", "textContent", "value"]),
        validationRegex: FieldValidationRegexSchema.optional(),
      })
      .strict(),
  ])
  .describe("Collect jobs surface field");

/** Fields for per-item detail pages (e.g. `innerHTML` + optional `format`). */
export const PlanStepCollectJobsDetailsFieldSchema = z
  .discriminatedUnion("type", [
    z
      .object({
        key: z.string().min(1).max(LIMITS.fieldKey),
        selector: CssSelectorSchema,
        type: z.literal("attribute"),
        value: z.string().min(1).max(LIMITS.attrName),
        validationRegex: FieldValidationRegexSchema.optional(),
      })
      .strict(),
    z
      .object({
        key: z.string().min(1).max(LIMITS.fieldKey),
        selector: CssSelectorSchema,
        type: z.literal("property"),
        value: z.enum(["innerText", "textContent", "value", "innerHTML"]),
        format: z.literal("tiptap").optional(),
        validationRegex: FieldValidationRegexSchema.optional(),
      })
      .strict(),
  ])
  .describe("Collect jobs details field");

/** Combined list surface + per-item detail extraction (single-tab flow). */
export const PlanStepCollectJobsInputSchema = z
  .object({
    surfaceUrl: z
      .url()
      .describe("Listing page URL used to open the surface tab for this step"),
    containerSector: CssSelectorSchema.describe("list container"),
    itemSelector: CssSelectorSchema.describe("row"),
    detailsUrlField: z
      .string()
      .min(1)
      .max(LIMITS.fieldKey)
      .describe(
        "key from `surfaceFields` holding the detail page URL for each listing",
      ),
    key: z
      .string()
      .min(1)
      .max(LIMITS.fieldKey * 4)
      .optional()
      .describe(
        "optional unique key template (e.g. `{{company}}-{{title}}`) used to identify jobs",
      ),
    pagination: z
      .object({
        kind: z.literal("next-button"),
        containerSelector: CssSelectorSchema.describe("pagination container"),
        nextButtonPartialMatch: z
          .string()
          .min(1)
          .max(LIMITS.selector)
          .describe("partial text match used to locate next-page button"),
      })
      .strict()
      .optional(),
    surfaceFields: z
      .array(PlanStepCollectJobsSurfaceFieldSchema)
      .max(LIMITS.listFields),
    detailsFields: z
      .array(PlanStepCollectJobsDetailsFieldSchema)
      .max(LIMITS.listFields),
    parallelDetailsTabs: z
      .number()
      .int()
      .min(1)
      .max(LIMITS.parallelDetailsTabs)
      .optional()
      .default(1)
      .describe(
        "max concurrent detail tabs when fetching `detailsFields` per listing row",
      ),
  })
  .strict();

const PlanStepActionScopeSchema = z
  .literal("public")
  .optional()
  .describe("If set, step result is returned under `data[id]`.");

export const PlanStepActionSchema = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("collect.jobs"),
        input: PlanStepCollectJobsInputSchema,
        scope: PlanStepActionScopeSchema,
        skipDelay: z
          .boolean()
          .optional()
          .describe(
            "when true, skip short delays around scroll-into-view and click on each row",
          ),
      })
      .strict(),
  ])
  .describe("Step action");

export const PlanStepSchema = z
  .object({ id: PlanStepIdSchema, action: PlanStepActionSchema })
  .strict()
  .describe("Plan step");

export const PlanSchema = z
  .object({
    id: z.uuid(),
    steps: z.array(PlanStepSchema).max(LIMITS.planSteps),
  })
  .strict()
  .describe("Strict JSON plan");
