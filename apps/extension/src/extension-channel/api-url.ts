/**
 * API origin for GraphQL + auth cookies (must match apps/web login target).
 * Override at build time: `PLASMO_PUBLIC_API_URL=https://api.example.com pnpm build`
 *
 * **`manifest.host_permissions`** is synced from this same URL by
 * **`scripts/sync-extension-host-permissions.mjs`** before `dev`/`build`/ `package`.
 *
 * Web app URL (sign-in / open-or-focus-tab): **`PLASMO_PUBLIC_WEB_URL`**. When unset,
 * local API on `localhost` or `127.0.0.1` port **3101** maps to the same host on **3100**.
 * Otherwise defaults to **`http://localhost:3100`** — set **`PLASMO_PUBLIC_WEB_URL`** for staging/prod builds.
 */
export function getApiBaseUrl(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.PLASMO_PUBLIC_API_URL?.trim()
      : undefined;
  const base = (
    fromEnv && fromEnv.length > 0 ? fromEnv : "http://localhost:3101"
  ).replace(/\/$/, "");
  return base;
}

export function getGraphqlSseUrl(): string {
  return `${getApiBaseUrl()}/stream`;
}

export function getWebAppUrl(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.PLASMO_PUBLIC_WEB_URL?.trim()
      : undefined;
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv.replace(/\/$/, "");
  }

  try {
    const api = new URL(getApiBaseUrl());
    const host = api.hostname.toLowerCase();
    if ((host === "localhost" || host === "127.0.0.1") && api.port === "3101") {
      const web = new URL(api.href);
      web.port = "3100";
      return web.origin;
    }
  } catch {
    // fall through
  }

  return "http://localhost:3100";
}

/** Root URL of the web app (for `chrome.tabs.create` / links). */
export function getWebAppLaunchUrl(): string {
  return new URL("/", `${getWebAppUrl()}/`).href;
}
