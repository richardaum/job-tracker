/**
 * Decorative tiles for the login mosaic ([P-142], [T-165]).
 * Static marketing-style highlights — not CMS or GraphQL-backed.
 */
export type LoginSpotlightIconKey =
  | "briefcase"
  | "chartLineUp"
  | "clipboardText"
  | "target"
  | "magicWand"
  | "funnel"
  | "calculator";

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
  readonly imageSrc: string;
  readonly imageSizes: string;
  readonly imageCaption?: string;
}

export type LoginSpotlightTile = LoginSpotlightCardTile | LoginSpotlightWideTile | LoginSpotlightVisualTile;

export const LOGIN_SPOTLIGHT_TILES: readonly LoginSpotlightTile[] = [
  {
    kind: "card",
    id: "applications",
    icon: "briefcase",
    title: "Every job in one place",
    body: "Companies, postings, stages, and notes stay linked so follow-ups stay quick.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-1 lg:row-start-1",
  },
  {
    kind: "card",
    id: "pipeline",
    icon: "chartLineUp",
    title: "Pipeline at a glance",
    body: "Skim statuses and next steps instead of bouncing between spreadsheets and bookmarks.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-5 lg:row-start-1",
  },
  {
    kind: "card",
    id: "match",
    icon: "target",
    title: "See your fit before you apply",
    body: "AI compares your resume against each posting and scores the match, so you know where to focus.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-9 lg:row-start-1",
  },
  {
    kind: "visual",
    id: "auto-fill",
    icon: "magicWand",
    title: "Paste a link, get a draft",
    body: "Drop in a posting or its URL and AI extracts the title, company, and requirements into a ready-to-edit draft.",
    layoutClassName: "h-full min-h-0 lg:col-span-8 lg:col-start-1 lg:row-start-2",
    imageSrc: "/login/paste-link-draft.png",
    imageSizes: "(min-width: 1024px) 620px, 90vw",
    imageCaption: "Draft-ready in seconds",
  },
  {
    kind: "visual",
    id: "team-rhythm",
    icon: "clipboardText",
    title: "Interview cadence",
    body: "Prep notes and outcomes sit beside each role so debriefs and offer comparisons stay grounded.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-2",
    imageSrc: "/login/interview-cadence.png",
    imageSizes: "(min-width: 1024px) 320px, 90vw",
    imageCaption: "Review-ready context",
  },
  {
    kind: "card",
    id: "signals",
    icon: "funnel",
    title: "Filter out the noise",
    body: "Block keywords and companies you don't want to see, so your list stays focused on roles worth your time.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-1 lg:row-start-3",
  },
  {
    kind: "card",
    id: "salary",
    icon: "calculator",
    title: "Know your number",
    body: "Compare offers with the built-in salary calculator, converted to your currency automatically.",
    layoutClassName: "h-full min-h-0 lg:col-span-4 lg:col-start-5 lg:row-start-3",
  },
] satisfies readonly LoginSpotlightTile[];
