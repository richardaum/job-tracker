import { EXTENSION_CHANNEL_STORAGE_KEY } from "./constants";

export type ExtensionChannelState = {
  status: "idle" | "connecting" | "streaming" | "auth_required" | "error";
  lastEventKind?: string;
  lastError?: string;
  updatedAt: number;
};

export async function writeChannelState(
  partial: Omit<ExtensionChannelState, "updatedAt"> &
    Partial<Pick<ExtensionChannelState, "updatedAt">>,
): Promise<void> {
  const next: ExtensionChannelState = {
    ...partial,
    updatedAt: partial.updatedAt ?? Date.now(),
  };
  await chrome.storage.local.set({ [EXTENSION_CHANNEL_STORAGE_KEY]: next });
}

export async function readChannelState(): Promise<
  ExtensionChannelState | undefined
> {
  const raw = await chrome.storage.local.get(EXTENSION_CHANNEL_STORAGE_KEY);
  const v = raw[EXTENSION_CHANNEL_STORAGE_KEY] as
    | ExtensionChannelState
    | undefined;
  return v;
}
