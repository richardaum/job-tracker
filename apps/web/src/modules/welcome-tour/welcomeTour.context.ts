"use client";

import { createContext } from "react";

import type { WelcomeTourPhase } from "./welcomeTour.types";

export interface WelcomeTourContextValue {
  activePhase: WelcomeTourPhase | null;
  start: () => void;
  completeCurrentSegment: () => void;
  complete: () => void;
  skip: () => void;
  createdJobToastId: string | null;
  setCreatedJobToastId: (toastId: string) => void;
  clearCreatedJobToastId: () => void;
  takeCreatedJobToastId: () => string | null;
}

export const WelcomeTourContext = createContext<WelcomeTourContextValue | null>(null);
