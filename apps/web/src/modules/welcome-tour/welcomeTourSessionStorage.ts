import { tryRun } from "@job-tracker/try-run";

import { WELCOME_TOUR_PHASES, type WelcomeTourPhase } from "./welcomeTour.types";

const WELCOME_TOUR_SESSION_STORAGE_KEY = "job-tracker:tour-session:v1";

export function readWelcomeTourSession(): WelcomeTourPhase | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(WELCOME_TOUR_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  const [parseError, parsedValue] = tryRun(() => JSON.parse(rawValue));
  if (parseError || parsedValue?.active !== true || parsedValue.tourId !== "welcome-tour") return null;

  return isWelcomeTourPhase(parsedValue.phase) ? parsedValue.phase : WELCOME_TOUR_PHASES[0];
}

export function persistWelcomeTourSession(phase: WelcomeTourPhase) {
  if (typeof window === "undefined") return;

  tryRun(() => {
    window.sessionStorage.setItem(
      WELCOME_TOUR_SESSION_STORAGE_KEY,
      JSON.stringify({ active: true, tourId: "welcome-tour", phase }),
    );
  });
}

export function clearWelcomeTourSession() {
  if (typeof window === "undefined") return;

  tryRun(() => window.sessionStorage.removeItem(WELCOME_TOUR_SESSION_STORAGE_KEY));
}

function isWelcomeTourPhase(value: unknown): value is WelcomeTourPhase {
  return typeof value === "string" && WELCOME_TOUR_PHASES.includes(value as WelcomeTourPhase);
}
