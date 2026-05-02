import { useEffect, useMemo, useState } from "react";

import { EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY } from "./constants";
import { type ExtensionChannelSseLogEntry } from "./sse-event-log";

/** Matches `enqueue({ kind: "HEARTBEAT", ... })` in `apps/api` extension-channel stream. */
const HEARTBEAT_KIND = "HEARTBEAT";

export type UseExtensionChannelSseLogResult = {
  entries: ExtensionChannelSseLogEntry[];
  /** True while stored log has any rows (includes filtered-out heartbeats). */
  hasStoredEntries: boolean;
};

export function useExtensionChannelSseLog(): UseExtensionChannelSseLogResult {
  const [storedEntries, setStoredEntries] = useState<
    ExtensionChannelSseLogEntry[]
  >([]);

  useEffect(() => {
    void chrome.storage.local
      .get(EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY)
      .then((raw) => {
        setStoredEntries(
          (raw[EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY] as
            | ExtensionChannelSseLogEntry[]
            | undefined) ?? [],
        );
      });

    const onStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== "local") {
        return;
      }
      const logCh = changes[EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY];
      if (logCh === undefined) {
        return;
      }
      const nextEntries = Array.isArray(logCh.newValue)
        ? (logCh.newValue as ExtensionChannelSseLogEntry[])
        : [];
      setStoredEntries(nextEntries);
    };
    chrome.storage.onChanged.addListener(onStorage);
    return () => chrome.storage.onChanged.removeListener(onStorage);
  }, []);

  return useMemo(
    () => ({
      entries: storedEntries.filter((e) => e.kind !== HEARTBEAT_KIND),
      hasStoredEntries: storedEntries.length > 0,
    }),
    [storedEntries],
  );
}
