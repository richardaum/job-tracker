import type { Route } from "next";

export function jobDetailsHref(basePath: string, opts?: { sidePanel?: string | null; fullWidth?: boolean }): Route {
  const params = new URLSearchParams();
  if (opts?.sidePanel) params.set("s", opts.sidePanel);
  if (opts?.fullWidth) params.set("w", "full");
  const qs = params.toString();
  return (qs ? `${basePath}?${qs}` : basePath) as Route;
}
