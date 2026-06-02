"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams, useSelectedLayoutSegment } from "next/navigation";
import { useCallback, useEffect } from "react";

const sidePanelTabs: string[] = ["notes", "history", "chat"];

export function useJobDetailsRouteState(id: string, isDesktop: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segment = useSelectedLayoutSegment();
  const activeTab = segment ?? "overview";

  const sidePanelParam = searchParams.get("s");
  const sidePanelFromQuery = sidePanelParam && sidePanelTabs.includes(sidePanelParam) ? sidePanelParam : null;
  const fullWidth = searchParams.get("w") === "full";

  const isSidePanelTab = sidePanelTabs.includes(activeTab);
  const needsRedirect = isDesktop && isSidePanelTab && !fullWidth;

  useEffect(() => {
    if (isDesktop) {
      if (!needsRedirect) return;
      const params = new URLSearchParams();
      params.set("s", activeTab);
      if (searchParams.get("w") === "full") params.set("w", "full");
      router.replace(`/jobs/${id}?${params.toString()}` as Route);
      return;
    }
    if (!sidePanelFromQuery) return;
    const params = new URLSearchParams();
    if (searchParams.get("w") === "full") params.set("w", "full");
    const qs = params.toString();
    router.replace(`/jobs/${id}/${sidePanelFromQuery}${qs ? `?${qs}` : ""}` as Route);
  }, [id, isDesktop, router, sidePanelFromQuery, needsRedirect, activeTab, searchParams]);

  const setSidePanel = useCallback(
    (sidePanel: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("s", sidePanel);
      router.replace(`${pathname}?${next.toString()}` as Route);
    },
    [pathname, router, searchParams],
  );

  const toggleFullWidth = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (fullWidth) {
      next.delete("w");
    } else {
      next.set("w", "full");
    }
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}` as Route);
  }, [pathname, router, searchParams, fullWidth]);

  return { activeTab, sidePanelFromQuery, fullWidth, toggleFullWidth, setSidePanel, needsRedirect };
}
