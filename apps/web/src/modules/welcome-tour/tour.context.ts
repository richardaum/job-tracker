"use client";

import { createContext } from "react";

import type { TourDefinition, TourId } from "@/modules/welcome-tour/welcomeTourDefinitions";

export interface TourContextValue {
  activeTour: TourDefinition | null;
  activeStepId: string | null;
  startTour: (tourId: TourId) => void;
  setActiveStepId: (stepId: string | null) => void;
}

export const TourContext = createContext<TourContextValue | null>(null);
