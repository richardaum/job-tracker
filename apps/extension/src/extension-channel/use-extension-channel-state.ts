import { useEffect, useState } from "react";

import { type ExtensionChannelState, readChannelState } from "./channel-state";
import { EXTENSION_CHANNEL_STORAGE_KEY } from "./constants";

export function useExtensionChannelState(): ExtensionChannelState | undefined {
  const [channel, setChannel] = useState<ExtensionChannelState | undefined>(
    undefined,
  );

  useEffect(() => {
    void readChannelState().then(setChannel);
    const onStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area !== "local") {
        return;
      }
      const ch = changes[EXTENSION_CHANNEL_STORAGE_KEY];
      if (ch?.newValue != null) {
        setChannel(ch.newValue as ExtensionChannelState);
      }
    };
    chrome.storage.onChanged.addListener(onStorage);
    return () => chrome.storage.onChanged.removeListener(onStorage);
  }, []);

  return channel;
}
