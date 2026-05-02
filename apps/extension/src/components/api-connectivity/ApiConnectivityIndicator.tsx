import type { JSX } from "react";

import { useExtensionChannelState } from "@/extension-channel/use-extension-channel-state";

import { ApiConnectivityDot } from "./ApiConnectivityDot";

/**
 * Dot with its own channel subscription — use where the parent does not call `useExtensionChannelState`.
 */
export function ApiConnectivityIndicator(): JSX.Element {
  const channel = useExtensionChannelState();
  return <ApiConnectivityDot channel={channel} />;
}
