"use client";

import type { ComponentProps } from "react";
import { EVENTS, Joyride, STATUS } from "react-joyride";

import { useWelcomeTour } from "./useWelcomeTour";

type WelcomeTourJoyrideProps = ComponentProps<typeof Joyride> & {
  onSegmentComplete?: () => void;
  onTourComplete?: () => void;
};
type WelcomeTourJoyrideEventHandler = NonNullable<WelcomeTourJoyrideProps["onEvent"]>;

/** Runs one route-local segment of the welcome tour. */
export function WelcomeTourJoyride({ onEvent, onSegmentComplete, onTourComplete, ...props }: WelcomeTourJoyrideProps) {
  const { completeCurrentSegment, complete } = useWelcomeTour();

  const handleEvent: WelcomeTourJoyrideEventHandler = (event, controls) => {
    onEvent?.(event, controls);

    const stepNumber = event.step.data?.stepNumber;
    const totalSteps = event.step.data?.totalSteps;
    if (event.type !== EVENTS.TOUR_END) return;

    if (event.status === STATUS.SKIPPED) {
      complete();
      return;
    }
    if (event.status !== STATUS.FINISHED) return;

    if (stepNumber === totalSteps) {
      complete();
      onTourComplete?.();
      return;
    }

    completeCurrentSegment();
    onSegmentComplete?.();
  };

  return <Joyride {...props} onEvent={handleEvent} />;
}
