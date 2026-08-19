"use client";

import { Button, cn, ConfirmDialog, conceptIcon, InfoTooltip, Text } from "@job-tracker/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useFeatureFlagEnabled } from "posthog-js/react";

import { useToastQueue } from "@/modules/jobs/shared/hooks/useToastQueue";
import { useWelcomeTour } from "@/modules/welcome-tour/useWelcomeTour";
import { WELCOME_TOUR_FEATURE_FLAG } from "@/modules/welcome-tour/welcomeTourSteps";
import { WELCOME_TOUR_PHASES } from "@/modules/welcome-tour/welcomeTour.types";
import { TourProgressStatus } from "@/gql/hooks";

interface WelcomeTourProgressTrackbarProps {
  onResetComplete?: () => void;
}

/** Displays welcome-tour progress and restarts its persisted tutorial state. */
export function WelcomeTourProgressTrackbar({ onResetComplete }: WelcomeTourProgressTrackbarProps) {
  const welcomeTourEnabled = useFeatureFlagEnabled(WELCOME_TOUR_FEATURE_FLAG);
  const router = useRouter();
  const { enqueueToast } = useToastQueue();
  const { activePhase, reset, tourStatus } = useWelcomeTour();

  if (welcomeTourEnabled !== true || tourStatus === TourProgressStatus.Skipped) return null;

  const totalSegments = WELCOME_TOUR_PHASES.length;
  const activeSegment = activePhase ? WELCOME_TOUR_PHASES.indexOf(activePhase) + 1 : 0;
  const completed = tourStatus === TourProgressStatus.Completed;
  const progressValue = completed ? totalSegments : activeSegment;
  const ResetIcon = conceptIcon.refresh;

  async function handleReset() {
    const didReset = await reset();
    if (!didReset) {
      enqueueToast({ title: "Could not reset the welcome tour. Please try again.", intent: "error" });
      throw new Error("Could not reset the welcome tour.");
    }

    onResetComplete?.();
    router.push("/jobs" as Route);
    enqueueToast({ title: "Welcome tour reset.", intent: "success" });
  }

  return (
    <div className={cn("mx-1 mb-3 rounded-md border border-border-default bg-bg-surface-subtle p-3")}>
      <div className={cn("mb-2 flex items-center gap-1")}>
        <div className={cn("flex items-center gap-1")}>
          <ResetIcon size={14} weight="regular" className={cn("shrink-0 text-text-secondary")} aria-hidden />
          <Text size="xs" weight="semibold" className={cn("text-text-secondary uppercase tracking-wider")}>
            Welcome tour
          </Text>
          <InfoTooltip
            size={12}
            maxWidth={200}
            content="Track the guided tour through NewJobTracker. Resetting clears only tutorial data and restarts at step one."
          />
        </div>
      </div>
      <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white")}>
        <div
          role="progressbar"
          aria-label="Welcome tour progress"
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={totalSegments}
          className={cn("h-full bg-border-success transition-all duration-300")}
          style={{ width: `${(progressValue / totalSegments) * 100}%` }}
        />
      </div>
      <ConfirmDialog
        trigger={
          <Button
            intent="ghost"
            size="sm"
            className={cn("mt-3 w-full")}
            leftIcon={<ResetIcon size={14} weight="regular" />}
          >
            Reset tour
          </Button>
        }
        title="Reset welcome tour"
        description="This clears your tutorial data and restarts the tour at step one. Your real jobs are not affected."
        confirmLabel="Reset tour"
        confirmIntent="primary"
        onConfirm={handleReset}
      />
    </div>
  );
}
