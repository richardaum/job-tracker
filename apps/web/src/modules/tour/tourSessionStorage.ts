import { tryRun } from "@job-tracker/try-run";

import type { TourRegistry, TourSession } from "@/modules/tour/tour.types";

const TOUR_SESSION_STORAGE_KEY = "job-tracker:tour-session:v1";

export function readTourSession(registry: TourRegistry): TourSession | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.sessionStorage.getItem(TOUR_SESSION_STORAGE_KEY);
  if (!rawValue) return null;

  const [parseError, parsedValue] = tryRun(() => JSON.parse(rawValue));
  if (parseError || parsedValue?.active !== true) return null;

  const tourId = parsedValue.tourId;
  if (typeof tourId !== "string") return null;

  const definition = registry[tourId];
  if (!definition) return null;

  return {
    id: tourId,
    phase: definition.phases.includes(parsedValue.phase) ? parsedValue.phase : definition.phases[0],
  };
}

export function persistTourSession(session: TourSession) {
  if (typeof window === "undefined") return;

  tryRun(() => {
    window.sessionStorage.setItem(
      TOUR_SESSION_STORAGE_KEY,
      JSON.stringify({ active: true, tourId: session.id, phase: session.phase }),
    );
  });
}

export function clearTourSession() {
  if (typeof window === "undefined") return;

  tryRun(() => window.sessionStorage.removeItem(TOUR_SESSION_STORAGE_KEY));
}
