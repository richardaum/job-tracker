import { ApplicationSource } from "@/gql/hooks";

export const APPLICATION_SOURCE_NOT_SET_LABEL = "Not set";

/** Human-readable label for job-board source (GraphQL enum → UI). */
export function formatApplicationSourceLabel(
  source: ApplicationSource | null | undefined,
): string | null {
  if (source == null) {
    return null;
  }
  switch (source) {
    case ApplicationSource.Linkedin:
      return "LinkedIn";
    case ApplicationSource.Jack:
      return "Jack";
    case ApplicationSource.Wellfound:
      return "Wellfound";
    case ApplicationSource.RemoteYeah:
      return "RemoteYeah";
    default:
      return null;
  }
}

/** Labels shown in the source combobox (fixed list; no free-form values). */
export function applicationSourceToComboLabel(
  source: ApplicationSource | null | undefined,
): string {
  if (source == null) {
    return APPLICATION_SOURCE_NOT_SET_LABEL;
  }
  return (
    formatApplicationSourceLabel(source) ?? APPLICATION_SOURCE_NOT_SET_LABEL
  );
}

/** Stable list for comboboxes (GraphQL enum + “Not set”). Built once for stable reference. */
export const APPLICATION_SOURCE_COMBO_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "__none__", label: APPLICATION_SOURCE_NOT_SET_LABEL },
  ...Object.values(ApplicationSource).map((s) => ({
    value: s,
    label: formatApplicationSourceLabel(s)!,
  })),
];

export function getApplicationSourceComboOptions(): Array<{
  value: string;
  label: string;
}> {
  return [...APPLICATION_SOURCE_COMBO_OPTIONS];
}

/**
 * Resolves combobox text to an enum value or null ("Not set").
 * Returns `"invalid"` when the text is not an exact match for a listed label.
 */
export function parseApplicationSourceComboLabel(
  draft: string,
): ApplicationSource | null | "invalid" {
  const t = draft.trim();
  if (t === APPLICATION_SOURCE_NOT_SET_LABEL) {
    return null;
  }
  for (const s of Object.values(ApplicationSource)) {
    const lbl = formatApplicationSourceLabel(s);
    if (lbl !== null && t === lbl) {
      return s;
    }
  }
  return "invalid";
}
