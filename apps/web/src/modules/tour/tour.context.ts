"use client";

import { createContext } from "react";

import type { ActiveTour } from "@/modules/tour/tour.types";

export interface TourContextValue {
  activeTour: ActiveTour | null;
  startTour: (tourId: string) => void;
  completeCurrentSegment: () => void;
  completeTour: () => void;
}

export const TourContext = createContext<TourContextValue | null>(null);
