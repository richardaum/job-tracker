import { JobSource } from "@/gql/hooks";

export const JOB_SOURCE_NOT_SET_LABEL = "Not set";

/** Human-readable label for job-board source (GraphQL enum → UI). */
export function formatJobSourceLabel(source: JobSource | null | undefined): string | null {
  if (source == null) {
    return null;
  }
  switch (source) {
    case JobSource.Linkedin:
      return "LinkedIn";
    case JobSource.Jack:
      return "Jack";
    case JobSource.Wellfound:
      return "Wellfound";
    case JobSource.RemoteYeah:
      return "RemoteYeah";
    default:
      return null;
  }
}

/** Labels shown in the source combobox (fixed list; no free-form values). */
export function jobSourceToComboLabel(source: JobSource | null | undefined): string {
  if (source == null) {
    return JOB_SOURCE_NOT_SET_LABEL;
  }
  return formatJobSourceLabel(source) ?? JOB_SOURCE_NOT_SET_LABEL;
}

/** Stable list for comboboxes (GraphQL enum + “Not set”). Built once for stable reference. */
export const JOB_SOURCE_COMBO_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "__none__", label: JOB_SOURCE_NOT_SET_LABEL },
  ...Object.values(JobSource).map((s) => ({
    value: s,
    label: formatJobSourceLabel(s)!,
  })),
];

export function getJobSourceComboOptions(): Array<{
  value: string;
  label: string;
}> {
  return [...JOB_SOURCE_COMBO_OPTIONS];
}

/**
 * Resolves combobox text to an enum value or null ("Not set").
 * Returns `"invalid"` when the text is not an exact match for a listed label.
 */
export function parseJobSourceComboLabel(draft: string): JobSource | null | "invalid" {
  const t = draft.trim();
  if (t === JOB_SOURCE_NOT_SET_LABEL) {
    return null;
  }
  for (const s of Object.values(JobSource)) {
    const lbl = formatJobSourceLabel(s);
    if (lbl !== null && t === lbl) {
      return s;
    }
  }
  return "invalid";
}
