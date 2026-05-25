"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  createExtensionBridgePing,
  EXTENSION_BRIDGE_PING_INTERVAL_MS,
  EXTENSION_BRIDGE_STALE_MS,
  isExtensionBridgePong,
} from "@/modules/admin/extension/lib/extension-bridge.protocol";

export type ExtensionConnectionStatus =
  | "checking"
  | "connected"
  | "disconnected";

export type ExtensionConnectionState = {
  status: ExtensionConnectionStatus;
  extensionVersion: string | null;
  browser: string | null;
  lastHeartbeatAt: string | null;
  webAppOrigin: string | null;
};

export type ExtensionConnectionViewModel = ExtensionConnectionState & {
  retry: () => void;
};

const INITIAL_CONNECTION_STATE: ExtensionConnectionState = {
  status: "checking",
  extensionVersion: null,
  browser: null,
  lastHeartbeatAt: null,
  webAppOrigin: null,
};

export function useExtensionConnectionStatus(): ExtensionConnectionViewModel {
  const [connection, setConnection] = useState<ExtensionConnectionState>(
    () => ({
      ...INITIAL_CONNECTION_STATE,
      webAppOrigin:
        typeof window !== "undefined" ? window.location.origin : null,
    }),
  );
  const [lastPongAt, setLastPongAt] = useState<number | null>(null);
  const [, setRelativeTimeTick] = useState(0);
  const sendPingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const webAppOrigin = window.location.origin;

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== webAppOrigin) return;
      if (!isExtensionBridgePong(event.data)) return;

      const receivedAt = Date.now();
      setLastPongAt(receivedAt);
      setConnection({
        status: "connected",
        extensionVersion: event.data.extensionVersion,
        browser: event.data.browser,
        lastHeartbeatAt: event.data.lastHeartbeatAt,
        webAppOrigin: event.data.webAppOrigin,
      });
    };

    const sendPing = () => {
      const requestId = crypto.randomUUID();
      window.postMessage(createExtensionBridgePing(requestId), webAppOrigin);
    };

    sendPingRef.current = sendPing;
    sendPing();
    const pingIntervalId = window.setInterval(
      sendPing,
      EXTENSION_BRIDGE_PING_INTERVAL_MS,
    );

    window.addEventListener("message", handleMessage);

    return () => {
      sendPingRef.current = null;
      window.clearInterval(pingIntervalId);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const retry = useCallback(() => {
    setLastPongAt(null);
    setConnection((current) => ({
      ...current,
      status: "checking",
      extensionVersion: null,
      browser: null,
      lastHeartbeatAt: null,
    }));
    sendPingRef.current?.();
  }, []);

  useEffect(() => {
    if (lastPongAt == null) {
      const timeoutId = window.setTimeout(() => {
        setConnection((current) =>
          current.status === "checking"
            ? { ...current, status: "disconnected" }
            : current,
        );
      }, EXTENSION_BRIDGE_PING_INTERVAL_MS);

      return () => window.clearTimeout(timeoutId);
    }

    const staleIntervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - lastPongAt;
      if (elapsedMs <= EXTENSION_BRIDGE_STALE_MS) return;

      setConnection((current) =>
        current.status === "connected"
          ? {
              ...current,
              status: "disconnected",
              extensionVersion: null,
              browser: null,
              lastHeartbeatAt: null,
            }
          : current,
      );
    }, 1_000);

    return () => window.clearInterval(staleIntervalId);
  }, [lastPongAt]);

  useEffect(() => {
    if (connection.status !== "connected") return;

    const tickIntervalId = window.setInterval(() => {
      setRelativeTimeTick((tick) => tick + 1);
    }, 1_000);

    return () => window.clearInterval(tickIntervalId);
  }, [connection.status]);

  return { ...connection, retry };
}
