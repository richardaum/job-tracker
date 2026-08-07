"use client";

import { tryRun } from "@job-tracker/try-run";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { WelcomeTourSessionContext } from "@/modules/welcome-tour/welcomeTourSession.context";

const WELCOME_TOUR_SESSION_STORAGE_KEY = "job-tracker:welcome-tour-session:v1";

type WelcomeTourSessionProviderProps = { children: ReactNode };

/**
 * Shares the in-progress tour across route-specific Joyride instances for the
 * lifetime of a browser tab. It intentionally remains active during testing.
 */
export function WelcomeTourSessionProvider({ children }: WelcomeTourSessionProviderProps) {
  const [activeWelcomeTour, setActiveWelcomeTour] = useState(readWelcomeTourSession);

  const startWelcomeTour = useCallback(() => {
    setActiveWelcomeTour((isActive) => {
      if (isActive) return true;

      persistWelcomeTourSession();
      return true;
    });
  }, []);

  const value = useMemo(() => ({ activeWelcomeTour, startWelcomeTour }), [activeWelcomeTour, startWelcomeTour]);

  return <WelcomeTourSessionContext.Provider value={value}>{children}</WelcomeTourSessionContext.Provider>;
}

function readWelcomeTourSession(): boolean {
  if (typeof window === "undefined") return false;

  const rawValue = window.sessionStorage.getItem(WELCOME_TOUR_SESSION_STORAGE_KEY);
  if (!rawValue) return false;

  const [parseError, parsedValue] = tryRun(() => JSON.parse(rawValue));
  return !parseError && parsedValue?.active === true;
}

function persistWelcomeTourSession() {
  if (typeof window === "undefined") return;

  tryRun(() => {
    window.sessionStorage.setItem(WELCOME_TOUR_SESSION_STORAGE_KEY, JSON.stringify({ active: true }));
  });
}
