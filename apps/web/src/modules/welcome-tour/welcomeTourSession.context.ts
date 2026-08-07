"use client";

import { createContext } from "react";

export interface WelcomeTourSessionContextValue {
  activeWelcomeTour: boolean;
  startWelcomeTour: () => void;
}

export const WelcomeTourSessionContext = createContext<WelcomeTourSessionContextValue | null>(null);
