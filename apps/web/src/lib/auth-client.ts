"use client";

import { createAuthClient } from "better-auth/client";

import { getApiBaseUrl } from "./api-endpoints";

function getAuthBaseUrl(): string {
  const apiBaseUrl = getApiBaseUrl();
  if (apiBaseUrl) return `${apiBaseUrl}/api/auth`;

  // Better Auth requires an absolute URL even when the API is reverse-proxied
  // to the same origin. The explicit fallback also keeps browser tests valid.
  const origin = typeof window === "undefined" ? "http://localhost:3100" : window.location.origin;
  return `${origin}/api/auth`;
}

export const authClient = createAuthClient({ baseURL: getAuthBaseUrl(), fetchOptions: { credentials: "include" } });

export function signInWithGoogle(callbackURL: string, selectAccount = false): Promise<unknown> {
  return authClient.signIn.social({
    provider: "google",
    callbackURL,
    ...(selectAccount ? { additionalParams: { prompt: "select_account" } } : {}),
  });
}
