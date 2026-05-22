import { ApplicationSourceEnum } from "./job-source.enum";

function inferSourceFromSingleUrl(url: string): ApplicationSourceEnum | null {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin")) {
    return ApplicationSourceEnum.LINKEDIN;
  }
  if (lower.includes("jack")) {
    return ApplicationSourceEnum.JACK;
  }
  if (lower.includes("wellfound")) {
    return ApplicationSourceEnum.WELLFOUND;
  }
  if (lower.includes("remoteyeah")) {
    return ApplicationSourceEnum.REMOTE_YEAH;
  }
  return null;
}

/**
 * Infers job-board source from one or many URLs (case-insensitive substring match).
 * Order: Linkedin → Jack → Wellfound → RemoteYeah (first match wins).
 */
export function inferJobSourceEnumFromUrls(
  urls: string[] | null | undefined,
): ApplicationSourceEnum | null {
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
