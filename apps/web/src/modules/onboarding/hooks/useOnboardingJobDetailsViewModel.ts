"use client";

import { ApplicationStage } from "@/gql/hooks";
import type { EntityDetailViewStatus } from "@/lib/entity-detail-view-status";
import type { JobDetailsValues } from "@/modules/jobs/details/utils/job-details.shared";
import { getOnboardingJobDraft, toSyntheticJob } from "@/modules/onboarding/utils/onboardingJobDraft";

export interface OnboardingJobDetailsViewModel {
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
 * Provides local onboarding data in the same shape consumed by the job details shell.
 */
export function useOnboardingJobDetailsViewModel(enabled: boolean): OnboardingJobDetailsViewModel {
  const draft = enabled ? getOnboardingJobDraft() : null;

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
