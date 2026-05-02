import { RECONNECT_CHANNEL_MESSAGE_TYPE } from "@/extension-channel/constants";

export function reconnectExtensionChannel(): void {
  void chrome.runtime.sendMessage({ type: RECONNECT_CHANNEL_MESSAGE_TYPE });
}
