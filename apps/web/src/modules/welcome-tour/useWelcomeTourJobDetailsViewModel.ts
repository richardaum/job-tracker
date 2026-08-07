"use client";

import { ApplicationStage } from "@/gql/hooks";
import type { EntityDetailViewStatus } from "@/lib/entity-detail-view-status";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { getWelcomeTourJobDraft, toSyntheticJob } from "@/modules/welcome-tour/welcomeTourJobDraft";

export interface WelcomeTourJobDetailsViewModel {
  job: JobDetailsValues | undefined;
  sourcePrimaryText: string | null;
  currentStage: ApplicationStage;
  currentStageReason: string | null;
  status: EntityDetailViewStatus;
  displayTitle: string | null;
  fillButtonState: "default" | "loading";
  triggerFillAutomatically: () => Promise<{ error: Error | null }>;
}

/**
 * Provides local welcome tour data in the same shape consumed by the job details shell.
 */
export function useWelcomeTourJobDetailsViewModel(enabled: boolean): WelcomeTourJobDetailsViewModel {
  const draft = enabled ? getWelcomeTourJobDraft() : null;

  return {
    job: draft ? toSyntheticJob(draft) : undefined,
    sourcePrimaryText: null,
    currentStage: ApplicationStage.New,
    currentStageReason: null,
    status: draft ? "success" : "notFound",
    displayTitle: draft?.title ?? null,
    fillButtonState: "default",
    triggerFillAutomatically: async () => ({ error: null }),
  };
}
