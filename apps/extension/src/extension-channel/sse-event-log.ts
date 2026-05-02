import { EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY } from "./constants";

const MAX_ENTRIES = 80;
const MAX_PAYLOAD_CHARS = 400;

export type ExtensionChannelSseLogEntry = {
  receivedAt: number;
  kind: string;
  payloadSnippet: string;
};

export async function clearExtensionChannelSseLog(): Promise<void> {
  await chrome.storage.local.set({
    [EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY]: [],
  });
}

export async function appendExtensionChannelSseLogEntry(
  kind: string,
  payloadJson: string | null | undefined,
): Promise<void> {
  const raw = payloadJson ?? "";
  const snippet =
    raw.length > MAX_PAYLOAD_CHARS
      ? `${raw.slice(0, MAX_PAYLOAD_CHARS)}…`
      : raw;
  const entry: ExtensionChannelSseLogEntry = {
    receivedAt: Date.now(),
    kind,
    payloadSnippet: snippet,
  };
  const stored = await chrome.storage.local.get(
    EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY,
  );
  const prev =
    (stored[EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY] as
      | ExtensionChannelSseLogEntry[]
      | undefined) ?? [];
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  await chrome.storage.local.set({
    [EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY]: next,
  });
}
