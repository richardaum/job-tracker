import { getWebAppLaunchUrl, getWebAppUrl } from "./api-url";

function webTabUrlMatchPatterns(): string[] {
  const patterns = new Set<string>();
  try {
    const origin = new URL(getWebAppUrl()).origin;
    patterns.add(`${origin}/*`);
    const u = new URL(origin);
    if (u.hostname === "localhost") {
      u.hostname = "127.0.0.1";
      patterns.add(`${u.origin}/*`);
    } else if (u.hostname === "127.0.0.1") {
      u.hostname = "localhost";
      patterns.add(`${u.origin}/*`);
    }
  } catch {
    patterns.add("http://localhost:3100/*");
  }
  return [...patterns];
}

/**
 * Focuses an existing Job Tracker web tab or opens a new one (same profile as the extension).
 */
export async function openOrFocusJobTrackerWebApp(): Promise<void> {
  const url = getWebAppLaunchUrl();
  const patterns = webTabUrlMatchPatterns();
  const tabs = await chrome.tabs.query({ url: patterns });
  const sorted = [...tabs].sort(
    (a, b) => (a.lastAccessed ?? 0) - (b.lastAccessed ?? 0),
  );
  const latest = sorted.at(-1);
  if (latest?.id != null) {
    await chrome.tabs.update(latest.id, { active: true });
    if (latest.windowId != null) {
      await chrome.windows.update(latest.windowId, { focused: true });
    }
    return;
  }
  await chrome.tabs.create({ url });
}
