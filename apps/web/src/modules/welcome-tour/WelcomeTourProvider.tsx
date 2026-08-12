"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { WelcomeTourContext } from "./welcomeTour.context";
import { clearWelcomeTourJobDraft } from "./welcomeTourJobDraft";
import {
  clearWelcomeTourSession,
  persistWelcomeTourSession,
  readWelcomeTourSession,
} from "./welcomeTourSessionStorage";
import { WELCOME_TOUR_PHASES } from "./welcomeTour.types";
import { useWelcomeTourProgressPersistence } from "./useWelcomeTourProgressPersistence";

type WelcomeTourProviderProps = { children: ReactNode };

export function WelcomeTourProvider({ children }: WelcomeTourProviderProps) {
  const [localPhase, setLocalPhase] = useState(readWelcomeTourSession);
  const [hasEnded, setHasEnded] = useState(false);
  const [createdJobToastId, setCreatedJobToastId] = useState<string | null>(null);
  const createdJobToastIdRef = useRef<string | null>(null);
  const { activePhase, saveCompleted, saveInProgress, saveSkipped, startState } = useWelcomeTourProgressPersistence({
    hasEnded,
    localPhase,
  });

  const start = useCallback(() => {
    const initialPhase = WELCOME_TOUR_PHASES[0];
    if (startState === "restart") {
      setLocalPhase(initialPhase);
      persistWelcomeTourSession(initialPhase);
      saveInProgress(initialPhase);
      return;
    }

    if (startState === "persist-session" && activePhase) {
      saveInProgress(activePhase);
      return;
    }

    if (startState !== "fresh") return;

    clearWelcomeTourJobDraft();
    setLocalPhase(initialPhase);
    persistWelcomeTourSession(initialPhase);
    saveInProgress(initialPhase);
  }, [activePhase, saveInProgress, startState]);

  const completeCurrentSegment = useCallback(() => {
    if (!activePhase || hasEnded) return;

    const nextPhase = WELCOME_TOUR_PHASES[WELCOME_TOUR_PHASES.indexOf(activePhase) + 1];
    if (!nextPhase) return;

    setLocalPhase(nextPhase);
    persistWelcomeTourSession(nextPhase);
    saveInProgress(nextPhase);
  }, [activePhase, hasEnded, saveInProgress]);

  const complete = useCallback(() => {
    setHasEnded(true);
    setLocalPhase(null);
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    clearWelcomeTourSession();
    saveCompleted();
  }, [saveCompleted]);

  const skip = useCallback(() => {
    setHasEnded(true);
    setLocalPhase(null);
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    clearWelcomeTourSession();
    saveSkipped();
  }, [saveSkipped]);

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
      skip,
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
      skip,
      start,
      takeCreatedJobToastId,
    ],
  );

  return <WelcomeTourContext.Provider value={value}>{children}</WelcomeTourContext.Provider>;
}
