/** Shown where a job `title` is null/blank (never use inside edit dialogs). */
export const JOB_DETAIL_TITLE_PLACEHOLDER = "Untitled Draft";

export function jobDetailDisplayTitle(
  title: string | null | undefined,
): string {
  const t = title?.trim();
  return t && t.length > 0 ? t : JOB_DETAIL_TITLE_PLACEHOLDER;
}
