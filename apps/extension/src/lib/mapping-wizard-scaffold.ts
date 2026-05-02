/** Side-panel mapping wizard — UI copy helpers (testable without Chrome). */

export const MAPPING_WIZARD_SCAFFOLD = {
  /** Short label for chrome side panel / menus. */
  panelTitle: "Job Tracker — mapping",
  heading: "Import mapping",
  subheading:
    "Wizard placeholder for board field mapping. Full flow follows importers and GraphQL.",
} as const;

export function formatExtensionVersionLabel(version: string): string {
  const v = version.trim() || "0.0.0";
  return `v${v}`;
}
