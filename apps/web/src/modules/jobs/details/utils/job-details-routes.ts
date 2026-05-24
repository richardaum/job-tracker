export type JobDetailsMainTab = "overview" | "description" | "source" | "match";

export type JobSidePanel = "notes" | "history";

export type JobDetailsTab = JobDetailsMainTab | JobSidePanel;

export function jobDetailsNotesFocusPath(jobId: string): string {
  return `/jobs/${jobId}/notes/focus`;
}

export function jobDetailsPath(
  jobId: string,
  tab: JobDetailsTab = "overview",
): string {
  if (tab === "overview") {
    return `/jobs/${jobId}`;
  }
  return `/jobs/${jobId}/${tab}`;
}

/** Desktop side panel: append `?s=` on main-tab routes only. */
export function jobDetailsHref(
  jobId: string,
  tab: JobDetailsMainTab,
  sidePanel?: JobSidePanel,
): string {
  const path = jobDetailsPath(jobId, tab);
  if (!sidePanel) {
    return path;
  }
  return `${path}?s=${sidePanel}`;
}

export function parseJobDetailsTab(pathname: string): JobDetailsTab {
  const match = pathname.match(
    /^\/jobs\/[^/]+\/(description|source|match|notes|history)$/,
  );
  if (!match) {
    return "overview";
  }
  return match[1] as JobDetailsTab;
}

export function parseJobDetailsMainTab(pathname: string): JobDetailsMainTab {
  const tab = parseJobDetailsTab(pathname);
  if (tab === "notes" || tab === "history") {
    return "overview";
  }
  return tab;
}

export function parseJobSidePanel(value: string | null): JobSidePanel | null {
  if (value === "notes" || value === "history") {
    return value;
  }
  return null;
}

export function isJobDetailsMainTab(
  tab: JobDetailsTab,
): tab is JobDetailsMainTab {
  return tab !== "notes" && tab !== "history";
}
