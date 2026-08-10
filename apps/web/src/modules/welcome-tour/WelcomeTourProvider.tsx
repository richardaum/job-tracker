"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { WelcomeTourContext } from "./welcomeTour.context";
import {
  clearWelcomeTourSession,
  persistWelcomeTourSession,
  readWelcomeTourSession,
} from "./welcomeTourSessionStorage";
import { WELCOME_TOUR_PHASES } from "./welcomeTour.types";

type WelcomeTourProviderProps = { children: ReactNode };

export function WelcomeTourProvider({ children }: WelcomeTourProviderProps) {
  const [activePhase, setActivePhase] = useState(readWelcomeTourSession);
  const [createdJobToastId, setCreatedJobToastId] = useState<string | null>(null);
  const createdJobToastIdRef = useRef<string | null>(null);

  const start = useCallback(() => {
    setActivePhase((currentPhase) => {
      if (currentPhase) return currentPhase;

      const initialPhase = WELCOME_TOUR_PHASES[0];
      persistWelcomeTourSession(initialPhase);
      return initialPhase;
    });
  }, []);

  const completeCurrentSegment = useCallback(() => {
    setActivePhase((currentPhase) => {
      if (!currentPhase) return null;

      const nextPhase = WELCOME_TOUR_PHASES[WELCOME_TOUR_PHASES.indexOf(currentPhase) + 1];
      if (!nextPhase) return currentPhase;

      persistWelcomeTourSession(nextPhase);
      return nextPhase;
    });
  }, []);

  const complete = useCallback(() => {
    setActivePhase(null);
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    clearWelcomeTourSession();
  }, []);

  const saveCreatedJobToastId = useCallback((toastId: string) => {
    createdJobToastIdRef.current = toastId;
    setCreatedJobToastId(toastId);
  }, []);

  const clearCreatedJobToastId = useCallback(() => {
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
  }, []);

  const takeCreatedJobToastId = useCallback(() => {
    const toastId = createdJobToastIdRef.current;
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    return toastId;
  }, []);

  const value = useMemo(
    () => ({
      activePhase,
      start,
      completeCurrentSegment,
      complete,
      createdJobToastId,
      setCreatedJobToastId: saveCreatedJobToastId,
      clearCreatedJobToastId,
      takeCreatedJobToastId,
    }),
    [
      activePhase,
      clearCreatedJobToastId,
      complete,
      completeCurrentSegment,
      createdJobToastId,
      saveCreatedJobToastId,
      start,
      takeCreatedJobToastId,
    ],
  );

  return <WelcomeTourContext.Provider value={value}>{children}</WelcomeTourContext.Provider>;
}
