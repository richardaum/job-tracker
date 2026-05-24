import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Routes removed during draft/job unification (`/tasks/integrate-draft-to-jobs`)
 * and match-as-tab (`/tasks/match-improvement`).
 * Kept in a standalone module so unit tests can assert rules without pulling in Sentry.
 */
export const legacyRouteRedirects: Redirect[] = [
  { source: "/matches/:id", destination: "/jobs/:id/match", permanent: true },
  {
    source: "/jobs/:id",
    has: [{ type: "query", key: "s", value: "notes" }],
    destination: "/jobs/:id/notes",
    permanent: false,
  },
  {
    source: "/jobs/:id",
    has: [{ type: "query", key: "s", value: "history" }],
    destination: "/jobs/:id/history",
    permanent: false,
  },
  { source: "/draft-jobs/:id", destination: "/jobs/:id", permanent: false },
  { source: "/draft-jobs", destination: "/jobs?q=draft", permanent: false },
];
