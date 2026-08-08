import { useSyncExternalStore } from "react";

import {
  getWelcomeTourJobDraft,
  getWelcomeTourJobDraftRevision,
  subscribeToWelcomeTourJobDraft,
  type WelcomeTourJobStageEvent,
} from "@/modules/welcome-tour/welcomeTourJobDraft";

/** Returns the local tutorial stage timeline and refreshes it after each local draft write. */
export function useWelcomeTourJobStageEvents(enabled: boolean): WelcomeTourJobStageEvent[] {
  // The draft lives outside React in localStorage, so subscribing to its revision makes local status writes refresh the timeline.
  useSyncExternalStore(subscribeToWelcomeTourJobDraft, getWelcomeTourJobDraftRevision, () => 0);

  if (!enabled) return [];
  return getWelcomeTourJobDraft()?.stageEvents ?? [];
}
