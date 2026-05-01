import { ApplicationSource } from "./application-source.enum";

/**
 * Infers job-board source from a URL (case-insensitive substring match).
 * Order: Linkedin → Jack → Wellfound (first match wins).
 */
export function inferApplicationSourceFromUrl(
  url: string | null | undefined,
): ApplicationSource | null {
  if (url == null || url === "") {
    return null;
  }
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
