import { clientEnv } from "@/env/client";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getApiBaseUrl(): string {
  return clientEnv.NEXT_PUBLIC_API_URL ? trimTrailingSlash(clientEnv.NEXT_PUBLIC_API_URL) : "";
}

// GraphQL is proxied through this origin (see next.config.ts rewrites) so the Better Auth
// session cookie, which belongs to this site, is sent along with every request.
export function getApiGraphqlUrl(): string {
  const origin = typeof window === "undefined" ? getApiBaseUrl() : window.location.origin;
  return `${origin}/graphql`;
}

export function getApiGraphqlWsUrl(): string {
  return getApiGraphqlUrl().replace(/^http/, "ws");
}
