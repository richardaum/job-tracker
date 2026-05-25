"use client";

import { useEffect } from "react";

import { TITLE_TEMPLATE } from "@/app/metadata";
import { formatJobPageTabTitle } from "@/modules/jobs/details/utils/job-detail-title";
import type { JobDetailsTab } from "@/modules/jobs/details/utils/job-details-routes";

const TAB_LABEL: Record<JobDetailsTab, string | undefined> = {
  overview: undefined,
  description: "Description",
  source: "Source content",
  match: "Match",
  notes: "Notes",
  history: "History",
};

type JobPageTitleSource = {
  title?: string | null;
  company?: { name?: string | null } | null;
};

export function useJobPageTitle(
  job: JobPageTitleSource | null | undefined,
  tab: JobDetailsTab,
): void {
  const title = job?.title;
  const companyName = job?.company?.name;
  const tabLabel = TAB_LABEL[tab];

  useEffect(() => {
    if (job == null) {
      return;
    }

    const pageTitle = formatJobPageTabTitle(title, companyName, { tabLabel });
    document.title = TITLE_TEMPLATE.replace("%s", pageTitle);
  }, [job, title, companyName, tabLabel]);
}
