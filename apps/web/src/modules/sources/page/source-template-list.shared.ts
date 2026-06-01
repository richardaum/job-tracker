import type { SourceTemplatesAllQuery } from "@/gql/graphql";

export type SourceListItem = SourceTemplatesAllQuery["sourceTemplates"][number];

export function scheduleSummary(template: { scheduleEnabled: boolean; scheduleCron?: string | null }): string {
  if (!template.scheduleEnabled) return "Schedule off";
  const cron = template.scheduleCron?.trim();
  return cron ? cron : "Schedule on (no cron)";
}
