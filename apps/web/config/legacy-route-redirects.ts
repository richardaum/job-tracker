import type { Redirect } from "next/dist/lib/load-custom-routes";

/**
 * Routes removed during draft/job unification (`/tasks/integrate-draft-to-jobs`).
 * Kept in a standalone module so unit tests can assert rules without pulling in Sentry.
 */
export const legacyRouteRedirects: Redirect[] = [
  { source: "/draft-jobs/:id", destination: "/jobs/:id", permanent: false },
  { source: "/draft-jobs", destination: "/jobs?q=draft", permanent: false },
];
