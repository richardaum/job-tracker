"use client";

import { createAuthClient } from "better-auth/client";

// Always same-origin: /api/auth is proxied to the API (see next.config.ts rewrites) so the
// Better Auth session cookie belongs to this site, not the cross-site API domain. Signing in
// via a direct cross-site fetch gets its state cookie partitioned away by Firefox/Safari.
function getAuthBaseUrl(): string {
  const origin = typeof window === "undefined" ? "http://localhost:3100" : window.location.origin;
  return `${origin}/api/auth`;
}

export const authClient = createAuthClient({ baseURL: getAuthBaseUrl(), fetchOptions: { credentials: "include" } });

export function signInWithGoogle(callbackURL: string, selectAccount = false): Promise<unknown> {
  return authClient.signIn.social({
    provider: "google",
    callbackURL,
    // New accounts start as Pending until an admin approves them. Without this, a first-time
    // signup follows the normal `callbackURL`, GraphQL rejects the pending session, and the
    // user bounces in a loop back to the sign-in popover with no explanation.
    newUserCallbackURL: `${window.location.origin}/login?status=pending`,
    ...(selectAccount ? { additionalParams: { prompt: "select_account" } } : {}),
  });
}
