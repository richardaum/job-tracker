import { EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY } from "@/extension-channel/constants";

export type ExtensionImportQueueUiState = {
  queuedCount: number;
  processorStatus: "idle" | "busy";
  updatedAt: number;
};

export async function writeImportQueueUiState(
  partial: Omit<ExtensionImportQueueUiState, "updatedAt"> &
    Partial<Pick<ExtensionImportQueueUiState, "updatedAt">>,
): Promise<void> {
  if (typeof chrome === "undefined" || chrome.storage?.local?.set == null) {
    return;
  }

  try {
    const next: ExtensionImportQueueUiState = {
      ...partial,
      updatedAt: partial.updatedAt ?? Date.now(),
    };
    await chrome.storage.local.set({
      [EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY]: next,
    });
  } catch {
    /** Ignore transient storage failures — UI treats missing reads as zeros. */
  }
}

export async function readImportQueueUiState(): Promise<
  ExtensionImportQueueUiState | undefined
> {
  if (typeof chrome === "undefined" || chrome.storage?.local?.get == null) {
    return undefined;
  }
  const raw = await chrome.storage.local.get(
    EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY,
  );
  return raw[EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY] as
    | ExtensionImportQueueUiState
    | undefined;
}
