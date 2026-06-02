"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import {
  useJobDetailsMainTab,
  useJobDetailsTab,
  useJobSidePanel,
  type JobSidePanel,
} from "@/modules/jobs/details/hooks/useJobDetailsRoute";
import { jobDetailsPath } from "@/modules/jobs/details/utils/job-details-routes";

export function useJobDetailsRouteState(id: string, isDesktop: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useJobDetailsTab();
  const mainTab = useJobDetailsMainTab();
  const sidePanelFromQuery = useJobSidePanel();

  useEffect(() => {
    if (isDesktop || !sidePanelFromQuery) {
      return;
    }
    router.replace(jobDetailsPath(id, sidePanelFromQuery));
  }, [id, isDesktop, router, sidePanelFromQuery]);

  const setSidePanel = useCallback(
    (sidePanel: JobSidePanel) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("s", sidePanel);
      router.replace(`${pathname}?${next.toString()}` as Route);
    },
    [pathname, router, searchParams],
  );

  return { activeTab, mainTab, sidePanelFromQuery, setSidePanel };
}
