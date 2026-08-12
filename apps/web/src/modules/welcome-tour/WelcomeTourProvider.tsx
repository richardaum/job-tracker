"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { TourProgressStatus } from "@/gql/hooks";

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
  const [hasLocallyReset, setHasLocallyReset] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState<TourProgressStatus | null>(null);
  const [createdJobToastId, setCreatedJobToastId] = useState<string | null>(null);
  const createdJobToastIdRef = useRef<string | null>(null);
  const hasEnded = terminalStatus !== null;
  const { activePhase, resetProgress, saveCompleted, saveInProgress, saveSkipped, startState, tourStatus } =
    useWelcomeTourProgressPersistence({ hasEnded, hasLocallyReset, localPhase });

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

  const reset = useCallback(async (): Promise<boolean> => {
    const initialPhase = WELCOME_TOUR_PHASES[0];
    const didReset = await resetProgress(initialPhase);
    if (!didReset) return false;

    clearWelcomeTourJobDraft();
    clearWelcomeTourSession();
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    setHasLocallyReset(true);
    setTerminalStatus(null);
    setLocalPhase(initialPhase);
    persistWelcomeTourSession(initialPhase);
    return true;
  }, [resetProgress]);

  const completeCurrentSegment = useCallback(() => {
    if (!activePhase || hasEnded) return;

    const nextPhase = WELCOME_TOUR_PHASES[WELCOME_TOUR_PHASES.indexOf(activePhase) + 1];
    if (!nextPhase) return;

    setLocalPhase(nextPhase);
    persistWelcomeTourSession(nextPhase);
    saveInProgress(nextPhase);
  }, [activePhase, hasEnded, saveInProgress]);

  const complete = useCallback(() => {
    setTerminalStatus(TourProgressStatus.Completed);
    setLocalPhase(null);
    createdJobToastIdRef.current = null;
    setCreatedJobToastId(null);
    clearWelcomeTourSession();
    saveCompleted();
  }, [saveCompleted]);

  const skip = useCallback(() => {
    setTerminalStatus(TourProgressStatus.Skipped);
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
      tourStatus: terminalStatus ?? tourStatus,
      start,
      reset,
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
      reset,
      takeCreatedJobToastId,
      terminalStatus,
      tourStatus,
    ],
  );

  return <WelcomeTourContext.Provider value={value}>{children}</WelcomeTourContext.Provider>;
}
