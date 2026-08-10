"use client";

import type { ComponentProps } from "react";
import { EVENTS, Joyride, STATUS } from "react-joyride";

import { useTour } from "@/modules/tour/useTour";

type JoyrideSegmentedTourProps = ComponentProps<typeof Joyride> & {
  onSegmentComplete?: () => void;
  onTourComplete?: () => void;
};
type JoyrideSegmentedTourEventHandler = NonNullable<JoyrideSegmentedTourProps["onEvent"]>;

/** Runs a route-local tour segment and completes the tour at its global final step. */
export function JoyrideSegmentedTour({
  onEvent,
  onSegmentComplete,
  onTourComplete,
  ...props
}: JoyrideSegmentedTourProps) {
  const { completeCurrentSegment, completeTour } = useTour();

  const handleEvent: JoyrideSegmentedTourEventHandler = (event, controls) => {
    onEvent?.(event, controls);

    const stepNumber = event.step.data?.stepNumber;
    const totalSteps = event.step.data?.totalSteps;
    if (event.type !== EVENTS.TOUR_END) return;

    if (event.status === STATUS.SKIPPED) {
      completeTour();
      return;
    }
    if (event.status !== STATUS.FINISHED) {
      return;
    }

    if (stepNumber === totalSteps) {
      completeTour();
      onTourComplete?.();
      return;
    }

    completeCurrentSegment();
    onSegmentComplete?.();
  };

  return <Joyride {...props} onEvent={handleEvent} />;
}
