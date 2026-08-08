"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { TourContext } from "@/modules/tour/tour.context";
import { clearTourSession, persistTourSession, readTourSession } from "@/modules/tour/tourSessionStorage";
import type { TourRegistry, TourSession } from "@/modules/tour/tour.types";

type TourProviderProps = { children: ReactNode; registry: TourRegistry };

/**
 * Provides the tour runtime for every registered tour definition.
 *
 * This provider is intentionally tour-agnostic: it owns lifecycle state and
 * delegates phase ordering, validation, and persistence to their respective
 * modules. Do not encode tour-specific IDs, phases, routes, or UI actions here.
 */
export function TourProvider({ children, registry }: TourProviderProps) {
  const [tourSession, setTourSession] = useState(() => readTourSession(registry));

  const startTour = useCallback(
    (tourId: string) => {
      setTourSession((currentSession) => {
        if (currentSession) return currentSession;

        const initialPhase = registry[tourId]?.phases[0];
        if (!initialPhase) return currentSession;

        const nextSession: TourSession = { id: tourId, phase: initialPhase };
        persistTourSession(nextSession);
        return nextSession;
      });
    },
    [registry],
  );

  const completeCurrentSegment = useCallback(
    () => setTourSession((session) => transitionToNextPhase(session, registry)),
    [registry],
  );

  const completeTour = useCallback(() => {
    setTourSession(null);
    clearTourSession();
  }, []);

  const activeTour = useMemo(
    () => (tourSession ? resolveActiveTour(tourSession, registry) : null),
    [registry, tourSession],
  );

  const value = useMemo(
    () => ({ activeTour, startTour, completeCurrentSegment, completeTour }),
    [activeTour, completeCurrentSegment, completeTour, startTour],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

function transitionToNextPhase(session: TourSession | null, registry: TourRegistry) {
  if (!session) return session;

  const phases = registry[session.id]?.phases;
  if (!phases) return session;

  const nextPhase = phases[phases.indexOf(session.phase) + 1];
  if (!nextPhase) return session;

  const nextSession: TourSession = { ...session, phase: nextPhase };
  persistTourSession(nextSession);
  return nextSession;
}

function resolveActiveTour(session: TourSession, registry: TourRegistry) {
  const definition = registry[session.id];
  return definition ? { ...definition, phase: session.phase } : null;
}
