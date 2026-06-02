"use client";

import { useEffect } from "react";

import { TITLE_TEMPLATE } from "@/app/metadata";
import { formatJobPageTabTitle } from "@/modules/jobs/details/utils/job-detail-title";

const TAB_LABEL: Record<string, string | undefined> = {
  overview: undefined,
  description: "Description",
  source: "Source content",
  match: "Match",
  notes: "Notes",
  history: "History",
  chat: "AI Chat",
};

type JobPageTitleSource = { title?: string | null; company?: { name?: string | null } | null };

export function useJobPageTitle(job: JobPageTitleSource | null | undefined, tab: string): void {
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
