import { tryRun } from "@job-tracker/try-run";

import {
  TourProgressStatus,
  useResetTourProgressMutation,
  useSaveTourProgressMutation,
  useTourProgressQuery,
} from "@/gql/hooks";

import { WELCOME_TOUR_PHASES, type WelcomeTourPhase } from "./welcomeTour.types";

const WELCOME_TOUR_ID = "welcome-tour";
const WELCOME_TOUR_VERSION = 1;

type WelcomeTourStartState = "blocked" | "fresh" | "persist-session" | "restart" | "resume";

interface UseWelcomeTourProgressPersistenceParams {
  hasEnded: boolean;
  hasLocallyReset: boolean;
  localPhase: WelcomeTourPhase | null;
}

interface WelcomeTourProgressPersistence {
  activePhase: WelcomeTourPhase | null;
  tourStatus: TourProgressStatus | null;
  resetProgress: (phase: WelcomeTourPhase) => Promise<boolean>;
  saveCompleted: () => void;
  saveInProgress: (phase: WelcomeTourPhase) => void;
  saveSkipped: () => void;
  startState: WelcomeTourStartState;
}

/** GraphQL-backed source of truth for restoring and recording welcome-tour progress. */
export function useWelcomeTourProgressPersistence({
  hasEnded,
  hasLocallyReset,
  localPhase,
}: UseWelcomeTourProgressPersistenceParams): WelcomeTourProgressPersistence {
  const { data, loading } = useTourProgressQuery({
    variables: { tourId: WELCOME_TOUR_ID },
    fetchPolicy: "network-only",
  });
  const [saveTourProgress] = useSaveTourProgressMutation();
  const [resetTourProgress] = useResetTourProgressMutation();
  const progress = data?.tourProgress;
  const shouldResetStoredVersion = progress?.tourVersion !== undefined && progress.tourVersion < WELCOME_TOUR_VERSION;
  const hasStoredTerminalStatus =
    !hasLocallyReset &&
    !shouldResetStoredVersion &&
    (progress?.status === TourProgressStatus.Completed || progress?.status === TourProgressStatus.Skipped);
  const storedPhase = toWelcomeTourPhase(progress?.currentStepId ?? null);
  const activePhase = getActivePhase({
    hasEnded,
    hasStoredTerminalStatus,
    isLoading: loading,
    localPhase,
    shouldResetStoredVersion,
    storedPhase,
  });
  const startState = getStartState({
    activePhase,
    hasEnded,
    hasStoredTerminalStatus,
    isLoading: loading,
    progressExists: progress !== undefined && progress !== null,
    shouldResetStoredVersion,
  });

  const save = (status: TourProgressStatus, currentStepId: WelcomeTourPhase | null) => {
    void tryRun(
      saveTourProgress({
        variables: { input: { tourId: WELCOME_TOUR_ID, tourVersion: WELCOME_TOUR_VERSION, status, currentStepId } },
      }),
    );
  };

  async function resetProgress(phase: WelcomeTourPhase): Promise<boolean> {
    const [error] = await tryRun(
      resetTourProgress({
        variables: { input: { tourId: WELCOME_TOUR_ID, tourVersion: WELCOME_TOUR_VERSION, currentStepId: phase } },
      }),
    );

    return !error;
  }

  return {
    activePhase,
    tourStatus: progress?.status ?? (localPhase ? TourProgressStatus.InProgress : null),
    resetProgress,
    saveCompleted: () => save(TourProgressStatus.Completed, null),
    saveInProgress: (phase) => save(TourProgressStatus.InProgress, phase),
    saveSkipped: () => save(TourProgressStatus.Skipped, null),
    startState,
  };
}

function toWelcomeTourPhase(stepId: string | null): WelcomeTourPhase | null {
  return WELCOME_TOUR_PHASES.find((phase) => phase === stepId) ?? null;
}

interface ActivePhaseParams {
  hasEnded: boolean;
  hasStoredTerminalStatus: boolean;
  isLoading: boolean;
  localPhase: WelcomeTourPhase | null;
  shouldResetStoredVersion: boolean;
  storedPhase: WelcomeTourPhase | null;
}

function getActivePhase({
  hasEnded,
  hasStoredTerminalStatus,
  isLoading,
  localPhase,
  shouldResetStoredVersion,
  storedPhase,
}: ActivePhaseParams): WelcomeTourPhase | null {
  if (isLoading || hasEnded || hasStoredTerminalStatus) return null;
  if (localPhase) return localPhase;
  if (shouldResetStoredVersion) return WELCOME_TOUR_PHASES[0];
  return storedPhase;
}

interface StartStateParams {
  activePhase: WelcomeTourPhase | null;
  hasEnded: boolean;
  hasStoredTerminalStatus: boolean;
  isLoading: boolean;
  progressExists: boolean;
  shouldResetStoredVersion: boolean;
}

function getStartState({
  activePhase,
  hasEnded,
  hasStoredTerminalStatus,
  isLoading,
  progressExists,
  shouldResetStoredVersion,
}: StartStateParams): WelcomeTourStartState {
  if (isLoading || hasEnded || hasStoredTerminalStatus) return "blocked";
  if (shouldResetStoredVersion) return "restart";
  if (!activePhase) return "fresh";
  return progressExists ? "resume" : "persist-session";
}
