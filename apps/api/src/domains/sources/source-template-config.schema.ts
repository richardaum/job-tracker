import { z } from "zod";

const stopWhenValues = ["CatchUp", "FirstRunMaxPages", "OlderThan"] as const;

const StopWhenSchema = z.enum(stopWhenValues);

export const SourceTemplateConfigSchema = z
  .object({
    stopWhen: z.array(StopWhenSchema),
    catchUpThreshold: z.number().int().positive().optional(),
    maxPages: z.number().int().positive().optional(),
    olderThanDays: z.number().int().positive().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    for (const sw of data.stopWhen) {
      if (sw === "CatchUp" && !data.catchUpThreshold) {
        ctx.addIssue({
          code: "custom",
          path: ["catchUpThreshold"],
          message: "Required when stopWhen includes CatchUp",
        });
      }
      if (sw === "FirstRunMaxPages" && !data.maxPages) {
        ctx.addIssue({
          code: "custom",
          path: ["maxPages"],
          message: "Required when stopWhen includes FirstRunMaxPages",
        });
      }
      if (sw === "OlderThan" && !data.olderThanDays) {
        ctx.addIssue({ code: "custom", path: ["olderThanDays"], message: "Required when stopWhen includes OlderThan" });
      }
    }
  });

export type SourceTemplateConfig = z.infer<typeof SourceTemplateConfigSchema>;

export function planHasPublishedAt(document: Record<string, unknown>): boolean {
  const steps = (document.steps ?? []) as Array<Record<string, unknown>>;
  return steps.some((step) => {
    const action = step.action as Record<string, unknown> | undefined;
    const input = action?.input as Record<string, unknown> | undefined;
    const surfaceFields = input?.surfaceFields as Array<Record<string, unknown>> | undefined;
    return surfaceFields?.some((sf) => sf.key === "publishedAt") ?? false;
  });
}
