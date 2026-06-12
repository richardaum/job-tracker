import type { Route } from "next";

/** Query params preserved when navigating between job-detail tabs via SafeLink. */
export const JOB_DETAILS_LINK_QUERY_PARAMS = ["w"] as const;

/** Query params preserved when job-detail layout redirects reshape the URL. */
export const JOB_DETAILS_LAYOUT_QUERY_PARAMS = ["w", "cid"] as const;

export function copySearchParams(target: URLSearchParams, source: URLSearchParams, keys: readonly string[]): void {
  for (const key of keys) {
    const value = source.get(key);
    if (value) target.set(key, value);
  }
}

export function jobDetailsHref(basePath: string, opts?: { sidePanel?: string | null; fullWidth?: boolean }): Route {
  const params = new URLSearchParams();
  if (opts?.sidePanel) params.set("s", opts.sidePanel);
  if (opts?.fullWidth) params.set("w", "full");
  const qs = params.toString();
  return (qs ? `${basePath}?${qs}` : basePath) as Route;
}
