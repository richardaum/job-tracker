import type { Job } from "@api/domains/jobs/jobs.schema";
import { htmlToPlainText } from "@api/domains/shared/html-plain-text.util";
import { tipTapToPlainText } from "@job-tracker/tiptap";

/**
 * Plain text used for JD ↔ resume alignment. Prefer captured {@link Job.htmlContent};
 * otherwise TipTap JSON in {@link Job.description}.
 */
export function resolveJobPostingPlainText(
  job: Pick<Job, "description" | "htmlContent">,
): string {
  const trimmedHtml = job.htmlContent?.trim();
  if (trimmedHtml) {
    const fromHtml = htmlToPlainText(trimmedHtml).trim();
    if (fromHtml) return fromHtml;
  }
  if (job.description?.trim()) {
    return tipTapToPlainText(job.description).trim();
  }
  return "";
}
