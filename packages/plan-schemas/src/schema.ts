import { tryRun } from "@job-tracker/try-run";
import { z } from "zod";

import { LIMITS } from "./constants";

const PlanStepIdSchema = z.string().min(1).max(LIMITS.stepId);

const CssSelectorSchema = z.string().min(1).max(LIMITS.selector);
const FieldValidationRegexSchema = z
  .object({ pattern: z.string().min(1).max(LIMITS.regexPattern), flags: z.string().max(LIMITS.regexFlags).optional() })
  .strict()
  .superRefine(({ pattern, flags }, ctx) => {
    const [regErr] = tryRun(() => {
      void new RegExp(pattern, flags);
    });
    if (regErr) {
      ctx.addIssue({ code: "custom", message: "Invalid validationRegex: pattern or flags are not valid" });
    }
  });

export const PlanStepCollectJobsSurfaceFieldSchema = z.discriminatedUnion("type", [
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
  z
    .object({
      key: z.string().min(1).max(LIMITS.fieldKey),
      type: z.literal("regex"),
      value: z.string().min(1).max(LIMITS.regexPattern),
      sourceField: z
        .string()
        .min(1)
        .max(LIMITS.fieldKey)
        .optional()
        .describe("which collected field to parse (default: concat all)"),
      flags: z.string().max(LIMITS.regexFlags).optional(),
      group: z.number().int().min(0).max(9).optional().default(1),
      required: z.boolean().optional().default(false),
    })
    .strict()
    .superRefine(({ value, flags }, ctx) => {
      const [regErr] = tryRun(() => void new RegExp(value, flags));
      if (regErr) {
        ctx.addIssue({ code: "custom", message: "Invalid regex pattern or flags" });
      }
    }),
]);

export const PlanStepCollectJobsDetailsFieldSchema = z.discriminatedUnion("type", [
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
      format: z.enum(["tiptap", "salary"]).optional(),
      validationRegex: FieldValidationRegexSchema.optional(),
    })
    .strict(),
]);

const ParseRegexFieldSchema = z
  .object({
    key: z.string().min(1).max(LIMITS.fieldKey),
    pattern: z.string().min(1).max(LIMITS.regexPattern),
    flags: z.string().max(LIMITS.regexFlags).optional(),
    group: z.number().int().min(0).max(9).optional().describe("capture group index (default 1)"),
    required: z.boolean().optional().describe("if true, fail when pattern does not match"),
  })
  .strict()
  .superRefine(({ pattern, flags }, ctx) => {
    const [regErr] = tryRun(() => void new RegExp(pattern, flags));
    if (regErr) {
      ctx.addIssue({ code: "custom", message: "Invalid pattern or flags" });
    }
  });

export const PlanStepCollectJobsInputSchema = z
  .object({
    containerSelector: CssSelectorSchema.describe("list container"),
    itemSelector: CssSelectorSchema.describe("row"),
    detailsUrlField: z
      .string()
      .min(1)
      .max(LIMITS.fieldKey)
      .describe("key from `surfaceFields` holding the detail page URL for each listing"),
    key: z
      .string()
      .min(1)
      .max(LIMITS.fieldKey * 4)
      .optional()
      .describe("optional unique key template (e.g. `{{company}}-{{title}}`) used to identify jobs"),
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
    surfaceFields: z.array(PlanStepCollectJobsSurfaceFieldSchema).max(LIMITS.listFields),
    detailsFields: z.array(PlanStepCollectJobsDetailsFieldSchema).max(LIMITS.listFields),
    direction: z
      .enum(["up", "down"])
      .optional()
      .default("down")
      .describe(
        "`down` (default) iterates top-to-bottom; `up` iterates bottom-to-top with incremental scroll for virtual-scroll containers",
      ),
    parallelDetailsTabs: z
      .number()
      .int()
      .min(1)
      .max(LIMITS.parallelDetailsTabs)
      .optional()
      .default(1)
      .describe("max concurrent detail tabs when fetching `detailsFields` per listing row"),
    skip: z
      .object({
        type: z.literal("regex"),
        value: z.string().min(1).max(LIMITS.regexPattern).describe("regex that matches items to skip"),
        sourceField: z
          .string()
          .min(1)
          .max(LIMITS.fieldKey)
          .optional()
          .describe("use a specific collected field instead of the concatenated text"),
        flags: z.string().max(LIMITS.regexFlags).optional(),
      })
      .strict()
      .superRefine(({ value, flags }, ctx) => {
        const [regErr] = tryRun(() => void new RegExp(value, flags));
        if (regErr) {
          ctx.addIssue({ code: "custom", message: "Invalid skip regex or flags" });
        }
      })
      .optional()
      .describe("when set, items matching the regex are excluded from collection"),
  })
  .strict();

const PlanStepActionScopeSchema = z
  .literal("public")
  .optional()
  .describe("If set, step result is returned under `data[id]`.");

export const PlanStepParseRegexInputSchema = z
  .object({
    text: z.string().min(1).max(LIMITS.regexTextInput),
    fields: z.array(ParseRegexFieldSchema).min(1).max(LIMITS.listFields),
  })
  .strict();

export const CollectJobsPlanStepActionSchema = z
  .object({
    kind: z.literal("collect.jobs"),
    input: PlanStepCollectJobsInputSchema,
    scope: PlanStepActionScopeSchema,
    skipDelay: z
      .boolean()
      .optional()
      .describe("when true, skip short delays around scroll-into-view and click on each row"),
  })
  .strict();

export const PlanStepActionSchema = z
  .discriminatedUnion("kind", [
    CollectJobsPlanStepActionSchema,
    z
      .object({
        kind: z.literal("parse.regex"),
        input: PlanStepParseRegexInputSchema,
        scope: PlanStepActionScopeSchema,
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
    boardType: z.enum(["Sequential", "NonSequential"]),
  })
  .strict()
  .describe("Strict JSON plan");
