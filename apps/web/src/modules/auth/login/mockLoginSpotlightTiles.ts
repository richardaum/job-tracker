/**
 * Decorative tiles for the login mosaic ([P-142], [T-165]).
 * Static marketing-style highlights — not CMS or GraphQL-backed.
 */
export type LoginSpotlightIconKey =
  | "briefcase"
  | "chartLineUp"
  | "clipboardText"
  | "pulse"
  | "folders"
  | "rss";

interface LoginSpotlightCardTile {
  readonly kind: "card";
  readonly id: string;
  readonly icon: LoginSpotlightIconKey;
  readonly title: string;
  readonly body: string;
  readonly layoutClassName: string;
}

interface LoginSpotlightWideTile {
  readonly kind: "wide";
  readonly id: string;
  readonly icon: LoginSpotlightIconKey;
  readonly title: string;
  readonly body: string;
  readonly layoutClassName: string;
  readonly accentSideLabel: string;
}

interface LoginSpotlightVisualTile {
  readonly kind: "visual";
  readonly id: string;
  readonly icon: LoginSpotlightIconKey;
  readonly title: string;
  readonly body: string;
  readonly layoutClassName: string;
  readonly imageCaption?: string;
}

export type LoginSpotlightTile =
  | LoginSpotlightCardTile
  | LoginSpotlightWideTile
  | LoginSpotlightVisualTile;

export interface LoginSpotlightNavTag {
  readonly id: string;
  readonly label: string;
  readonly active: boolean;
}

export const LOGIN_SPOTLIGHT_TILES: readonly LoginSpotlightTile[] = [
  {
    kind: "card",
    id: "applications",
    icon: "briefcase",
    title: "Every job in one place",
    body: "Companies, postings, stages, and notes stay linked so follow-ups stay quick.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-1 lg:row-start-1",
  },
  {
    kind: "card",
    id: "pipeline",
    icon: "chartLineUp",
    title: "Pipeline at a glance",
    body: "Skim statuses and next steps instead of bouncing between spreadsheets and bookmarks.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-5 lg:row-start-1",
  },
  {
    kind: "card",
    id: "sources",
    icon: "rss",
    title: "Save roles from the browser",
    body: "Capture listings with the Job Tracker Chrome extension next to everything else you track.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-9 lg:row-start-1",
  },
  {
    kind: "visual",
    id: "imports",
    icon: "folders",
    title: "Importer templates",
    body: "Reusable import setups and rerun history replace one-off spreadsheets when feeds or boards change.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-8 lg:col-start-1 lg:row-start-2",
    imageCaption: "Templates & reruns preview",
  },
  {
    kind: "visual",
    id: "team-rhythm",
    icon: "clipboardText",
    title: "Interview cadence",
    body: "Prep notes and outcomes sit beside each role so debriefs and offer comparisons stay grounded.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-2",
    imageCaption: "Review-ready context",
  },
  {
    kind: "card",
    id: "signals",
    icon: "pulse",
    title: "Progress without noise",
    body: "A light dashboard reminds you when timing matters—not to live inside another analytics tool.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-1 lg:row-start-3",
  },
  {
    kind: "card",
    id: "posting-to-pipeline",
    icon: "rss",
    title: "From URL to next step",
    body: "One card holds the posting link, title, stage, and the action you owe yourself this week.",
    layoutClassName:
      "h-full min-h-0 lg:col-span-4 lg:col-start-5 lg:row-start-3",
  },
] satisfies readonly LoginSpotlightTile[];

export const LOGIN_SPOTLIGHT_NAV_TAGS: readonly LoginSpotlightNavTag[] = [
  { id: "overview", label: "Overview", active: true },
  { id: "applications", label: "Applications", active: false },
  { id: "pipeline", label: "Pipeline", active: false },
  { id: "extension", label: "Extension", active: false },
  { id: "imports", label: "Imports", active: false },
] satisfies readonly LoginSpotlightNavTag[];
