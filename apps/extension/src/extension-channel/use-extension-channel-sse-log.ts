import { useEffect, useState } from "react";

import { EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY } from "./constants";
import { type ExtensionChannelSseLogEntry } from "./sse-event-log";

export function useExtensionChannelSseLog(): ExtensionChannelSseLogEntry[] {
  const [entries, setEntries] = useState<ExtensionChannelSseLogEntry[]>([]);

  useEffect(() => {
    void chrome.storage.local
      .get(EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY)
      .then((raw) => {
        setEntries(
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
      setEntries(nextEntries);
    };
    chrome.storage.onChanged.addListener(onStorage);
    return () => chrome.storage.onChanged.removeListener(onStorage);
  }, []);

  return entries;
}
