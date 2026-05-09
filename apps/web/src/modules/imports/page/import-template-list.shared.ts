import type { ImportTemplatesForImporterQuery } from "@/gql/graphql";

export type ImportTemplateListItem =
  ImportTemplatesForImporterQuery["importTemplatesForImporter"][number];

export function scheduleSummary(template: ImportTemplateListItem): string {
  if (!template.scheduleEnabled) return "Schedule off";
  const cron = template.scheduleCron?.trim();
  return cron ? cron : "Schedule on (no cron)";
}
