import { useEffect } from "react";

type PollControls = {
  startPolling: (interval: number) => void;
  stopPolling: () => void;
};

export function usePoll(
  controls: PollControls | undefined,
  shouldPoll: boolean,
  intervalMs: number,
) {
  const { startPolling, stopPolling } = controls ?? {};

  useEffect(() => {
    if (shouldPoll && startPolling && stopPolling) {
      startPolling(intervalMs);
      return () => stopPolling();
    }
    stopPolling?.();
  }, [shouldPoll, startPolling, stopPolling, intervalMs]);
}
