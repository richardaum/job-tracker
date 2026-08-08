"use client";

import { tryRun } from "@job-tracker/try-run";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { TourContext } from "@/modules/welcome-tour/tour.context";
import { TOUR_DEFINITIONS, type TourId } from "@/modules/welcome-tour/welcomeTourDefinitions";

const TOUR_SESSION_STORAGE_KEY = "job-tracker:welcome-tour-session:v1";

type TourProviderProps = { children: ReactNode };

/** Shares the active tour and its capabilities across route-specific tour UI. */
export function TourProvider({ children }: TourProviderProps) {
  const [activeTourId, setActiveTourId] = useState(readTourSession);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  const startTour = useCallback((tourId: TourId) => {
    setActiveTourId((currentTourId) => {
      if (currentTourId) return currentTourId;

      persistTourSession(tourId);
      return tourId;
    });
  }, []);

  const activeTour = activeTourId ? TOUR_DEFINITIONS[activeTourId] : null;
  const value = useMemo(
    () => ({ activeTour, activeStepId, startTour, setActiveStepId }),
    [activeTour, activeStepId, startTour],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

function readTourSession(): TourId | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(TOUR_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  const [parseError, parsedValue] = tryRun(() => JSON.parse(rawValue));
  if (parseError || parsedValue?.active !== true) return null;

  // Sessions created before tours had an identifier still represent this tour.
  return "welcome-tour";
}

function persistTourSession(tourId: TourId) {
  if (typeof window === "undefined") return;

  tryRun(() => {
    window.sessionStorage.setItem(TOUR_SESSION_STORAGE_KEY, JSON.stringify({ active: true, tourId }));
  });
}
