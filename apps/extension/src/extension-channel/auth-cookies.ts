function resolveApiCookiesLookupUrl(apiBaseUrl: string): string {
  const origin = apiBaseUrl.startsWith("http")
    ? apiBaseUrl
    : `https://${apiBaseUrl}`;
  return `${origin}/`;
}

/**
 * Detects API session cookies via `chrome.cookies` (spec 023 · P-119).
 * Do not use the return value as a `Cookie` request header in extension `fetch`:
 * browsers forbid setting `Cookie` from script; use `credentials: "include"` instead.
 * Requires `cookies` permission + host access to the API origin.
 */
export async function buildApiCookieHeader(
  apiBaseUrl: string,
): Promise<string | undefined> {
  const baseUrl = resolveApiCookiesLookupUrl(apiBaseUrl);

  const [access, refresh] = await Promise.all([
    chrome.cookies.get({ url: baseUrl, name: "access_token" }),
    chrome.cookies.get({ url: baseUrl, name: "refresh_token" }),
  ]);

  const parts: string[] = [];
  if (access?.value) {
    parts.push(`access_token=${access.value}`);
  }
  if (refresh?.value) {
    parts.push(`refresh_token=${refresh.value}`);
  }

  return parts.length > 0 ? parts.join("; ") : undefined;
}

/**
 * Mirrors web `POST /auth/refresh` (`apps/web/src/lib/auth-refresh-link.ts`) so the SSE client
 * can recover after the ~15min access JWT expires without requiring a new OAuth flow.
 */
export async function tryRefreshApiAccessToken(
  apiBaseUrl: string,
): Promise<boolean> {
  const lookupUrl = resolveApiCookiesLookupUrl(apiBaseUrl);
  const refresh = await chrome.cookies.get({
    url: lookupUrl,
    name: "refresh_token",
  });
  if (refresh?.value == null || refresh.value.length === 0) {
    return false;
  }

  const base = apiBaseUrl.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}
