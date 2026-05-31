import type { Route } from "next";

export type JobDetailsMainTab = "overview" | "description" | "source" | "match";

export type JobSidePanel = "notes" | "history";

export type JobDetailsTab = JobDetailsMainTab | JobSidePanel;

export function jobDetailsNotesFocusPath(jobId: string): Route {
  return `/jobs/${jobId}/notes/focus` as Route;
}

export function jobDetailsPath(
  jobId: string,
  tab: JobDetailsTab = "overview",
): Route {
  if (tab === "overview") {
    return `/jobs/${jobId}` as Route;
  }
  return `/jobs/${jobId}/${tab}` as Route;
}

/** Desktop side panel: append `?s=` on main-tab routes only. */
export function jobDetailsHref(
  jobId: string,
  tab: JobDetailsMainTab,
  sidePanel?: JobSidePanel,
): Route {
  const path = jobDetailsPath(jobId, tab);
  if (!sidePanel) {
    return path;
  }
  return `${path}?s=${sidePanel}` as Route;
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

export function isJobDetailsSidePanelTab(
  tab: JobDetailsTab,
): tab is JobSidePanel {
  return tab === "notes" || tab === "history";
}
