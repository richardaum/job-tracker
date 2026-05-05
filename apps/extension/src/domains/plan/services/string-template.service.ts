import { Job } from "@/domains/dom/types";

export class StringTemplateService {
  /**
   * Replace `{{field}}` placeholders with values from the provided map.
   * Missing fields are replaced with an empty segment.
   */
  parse(template: string, values: Job): string {
    const parsed = template.replaceAll(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (_match, fieldName: string): string => {
        const value = values[fieldName];
        return this.normalizeTemplateSegment(value);
      },
    );

    return parsed.trim().replaceAll(/\s+/g, " ");
  }

  private normalizeTemplateSegment(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    return "";
  }
}
