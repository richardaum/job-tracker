"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  type JobDetailsMainTab,
  type JobDetailsTab,
  type JobSidePanel,
  parseJobDetailsMainTab,
  parseJobDetailsTab,
  parseJobSidePanel,
} from "@/modules/jobs/details/utils/job-details-routes";

export type { JobDetailsMainTab, JobDetailsTab, JobSidePanel };

export function useJobDetailsTab(): JobDetailsTab {
  const pathname = usePathname();
  return parseJobDetailsTab(pathname);
}

export function useJobDetailsMainTab(): JobDetailsMainTab {
  const pathname = usePathname();
  return parseJobDetailsMainTab(pathname);
}

export function useJobSidePanel(): JobSidePanel | null {
  const searchParams = useSearchParams();
  return parseJobSidePanel(searchParams.get("s"));
}
