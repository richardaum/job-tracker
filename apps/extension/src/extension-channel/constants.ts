/** chrome.storage.local key for GraphQL-over-SSE channel status (background ↔ popup). */
export const EXTENSION_CHANNEL_STORAGE_KEY = "extensionGraphqlChannelV1";

/** chrome.storage.local key — import run queue depth + processor idle/busy (background ↔ popup). */
export const EXTENSION_IMPORT_QUEUE_UI_STORAGE_KEY =
  "extensionImportRunQueueUiV1";

/** chrome.storage.local — recent GraphQL-over-SSE payloads (debug; background → side panel). */
export const EXTENSION_CHANNEL_SSE_LOG_STORAGE_KEY = "extensionChannelSseLogV1";

/** `chrome.runtime.sendMessage` — ask the service worker to reconnect the SSE client. */
export const RECONNECT_CHANNEL_MESSAGE_TYPE = "job-tracker/reconnect-channel";

/** Must match `EXTENSION_CHANNEL_KIND_IMPORT_RUN_CREATED` in `apps/api` (same string literal). */
export const EXTENSION_CHANNEL_EVENT_IMPORT_RUN_CREATED = "IMPORT_RUN_CREATED";

export const EXTENSION_CHANNEL_SUBSCRIPTION = `subscription ExtensionChannel {
  extensionChannel {
    kind
    payloadJson
  }
}` as const;
