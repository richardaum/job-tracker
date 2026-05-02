import { useEffect, useState } from "react";

import { EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY } from "@/extension-channel/constants";

import {
  type ExtensionImportQueueUiState,
  readImportQueueUiState,
} from "./import-queue-ui-state";

const DEFAULT_IMPORT_QUEUE_UI: ExtensionImportQueueUiState = {
  queuedCount: 0,
  processorStatus: "idle",
  updatedAt: 0,
};

export function useImportQueueUiState(): ExtensionImportQueueUiState {
  const [snapshot, setSnapshot] = useState<ExtensionImportQueueUiState>(
    DEFAULT_IMPORT_QUEUE_UI,
  );

  useEffect(() => {
    void readImportQueueUiState().then((v) =>
      setSnapshot(v ?? DEFAULT_IMPORT_QUEUE_UI),
    );

    const onStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== "local") {
        return;
      }
      const ch = changes[EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY];
      if (ch?.newValue != null) {
        setSnapshot(ch.newValue as ExtensionImportQueueUiState);
      }
    };

    chrome.storage.onChanged.addListener(onStorage);
    return (): void => chrome.storage.onChanged.removeListener(onStorage);
  }, []);

  return snapshot;
}
