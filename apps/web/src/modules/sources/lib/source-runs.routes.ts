import type { Route } from "next";

export function sourceRunJobsHref(runId: string): Route {
  return `/jobs?q=new&runId=${encodeURIComponent(runId)}`;
}
