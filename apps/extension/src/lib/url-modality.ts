/**
 * Infer board URL modality for supported hosts — listing page vs single job deeplink.
 * Pure helper — exercised by Vitest without any extension host.
 */

export type UrlBoardModality = "listing" | "single-job" | "unknown";

export type InferModalityOpts = Readonly<{ hostVariants?: readonly string[] }>;

/** Host/path heuristics are intentionally narrow here; tighten per importer. */
const DEFAULT_LINKEDIN_HOSTS = ["www.linkedin.com", "linkedin.com"] as const;

export function inferLinkedInJobsModality(
  rawUrl: string,
  opts: InferModalityOpts = {},
): UrlBoardModality {
  try {
    const parsed = new URL(rawUrl.trim());
    const hosts = [...(opts.hostVariants ?? DEFAULT_LINKEDIN_HOSTS)];

    if (!hosts.includes(parsed.hostname)) {
      return "unknown";
    }

    if (parsed.pathname.includes("/jobs/view/")) {
      return "single-job";
    }

    if (parsed.pathname.startsWith("/jobs/search")) {
      return "listing";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
