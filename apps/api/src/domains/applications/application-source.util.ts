import { ApplicationSource } from "./application-source.enum";

function inferSourceFromSingleUrl(url: string): ApplicationSource | null {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin")) {
    return ApplicationSource.LINKEDIN;
  }
  if (lower.includes("jack")) {
    return ApplicationSource.JACK;
  }
  if (lower.includes("wellfound")) {
    return ApplicationSource.WELLFOUND;
  }
  return null;
}

/**
 * Infers job-board source from one or many URLs (case-insensitive substring match).
 * Order: Linkedin → Jack → Wellfound (first match wins).
 */
export function inferApplicationSourceFromUrls(
  urls: string[] | null | undefined,
): ApplicationSource | null {
  if (!urls || urls.length === 0) {
    return null;
  }

  for (const url of urls) {
    const trimmed = url.trim();
    if (!trimmed) {
      continue;
    }
    const inferred = inferSourceFromSingleUrl(trimmed);
    if (inferred) {
      return inferred;
    }
  }
  return null;
}
