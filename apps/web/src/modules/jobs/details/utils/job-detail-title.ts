/** Shown where a job `title` is null/blank (never use inside edit dialogs). */
export const JOB_DETAIL_TITLE_PLACEHOLDER = "Untitled Draft";

export const JOB_PAGE_TAB_TITLE_FALLBACK = "Job details";

export function jobDetailDisplayTitle(
  title: string | null | undefined,
): string {
  const t = title?.trim();
  return t && t.length > 0 ? t : JOB_DETAIL_TITLE_PLACEHOLDER;
}

export function formatJobPageTabTitle(
  title: string | null | undefined,
  companyName: string | null | undefined,
  options?: { fallback?: string; tabLabel?: string },
): string {
  const fallback = options?.fallback ?? JOB_PAGE_TAB_TITLE_FALLBACK;
  const trimmedTitle = title?.trim();
  const base =
    trimmedTitle && trimmedTitle.length > 0
      ? companyName?.trim()
        ? `${trimmedTitle} @ ${companyName.trim()}`
        : trimmedTitle
      : fallback;
  const tabLabel = options?.tabLabel?.trim();
  return tabLabel ? `${base} — ${tabLabel}` : base;
}
