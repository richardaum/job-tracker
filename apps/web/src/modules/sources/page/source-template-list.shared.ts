import type { SourcesForSourceProfileQuery } from "@/gql/graphql";

export type SourceListItem =
  SourcesForSourceProfileQuery["sourcesForSourceProfile"][number];

export function scheduleSummary(template: SourceListItem): string {
  if (!template.scheduleEnabled) return "Schedule off";
  const cron = template.scheduleCron?.trim();
  return cron ? cron : "Schedule on (no cron)";
}
