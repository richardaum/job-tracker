"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { generateUuid } from "@/lib/generate-uuid";

import type {
  ExtensionBridgeAuthStatus,
  ExtensionBridgePong,
} from "@/modules/admin/extension/lib/extension-bridge.protocol";
import {
  createExtensionBridgePing,
  EXTENSION_BRIDGE_PROBE_TIMEOUT_MS,
  isExtensionBridgePing,
  isExtensionBridgePong,
} from "@/modules/admin/extension/lib/extension-bridge.protocol";

export type ExtensionConnectionStatus = "checking" | "connected" | "disconnected";

export type ExtensionConnectionState = {
  status: ExtensionConnectionStatus;
  extensionVersion: string | null;
  browser: string | null;
  lastHeartbeatAt: string | null;
  webAppOrigin: string | null;
  authStatus: ExtensionBridgeAuthStatus | null;
  authenticatedEmail: string | null;
};

export type ExtensionConnectionViewModel = ExtensionConnectionState & { retry: () => void };

const INITIAL_CONNECTION_STATE: ExtensionConnectionState = {
  status: "checking",
  extensionVersion: null,
  browser: null,
  lastHeartbeatAt: null,
  webAppOrigin: null,
  authStatus: null,
  authenticatedEmail: null,
};

function connectionFromPong(data: ExtensionBridgePong): ExtensionConnectionState {
  return {
    status: "connected",
    extensionVersion: data.extensionVersion,
    browser: data.browser,
    lastHeartbeatAt: data.lastHeartbeatAt,
    webAppOrigin: data.webAppOrigin,
    authStatus: data.authStatus,
    authenticatedEmail: data.authenticatedEmail,
  };
}

function clearedConnectionFields(current: ExtensionConnectionState): ExtensionConnectionState {
  return {
    ...current,
    status: "checking",
    extensionVersion: null,
    browser: null,
    lastHeartbeatAt: null,
    authStatus: null,
    authenticatedEmail: null,
  };
}

function disconnectedConnectionFields(current: ExtensionConnectionState): ExtensionConnectionState {
  return {
    ...current,
    status: "disconnected",
    extensionVersion: null,
    browser: null,
    lastHeartbeatAt: null,
    authStatus: null,
    authenticatedEmail: null,
  };
}

export function useExtensionConnectionStatus(): ExtensionConnectionViewModel {
  const [connection, setConnection] = useState<ExtensionConnectionState>(() => ({
    ...INITIAL_CONNECTION_STATE,
    webAppOrigin: typeof window !== "undefined" ? window.location.origin : null,
  }));
  const probeTimeoutRef = useRef<number | null>(null);
  const retryRef = useRef<(() => void) | null>(null);
  const probeStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const webAppOrigin = window.location.origin;

    const clearProbeTimeout = () => {
      if (probeTimeoutRef.current == null) return;
      window.clearTimeout(probeTimeoutRef.current);
      probeTimeoutRef.current = null;
    };

    const scheduleProbeTimeout = () => {
      clearProbeTimeout();
      probeTimeoutRef.current = window.setTimeout(() => {
        setConnection((current) => (current.status === "checking" ? disconnectedConnectionFields(current) : current));
      }, EXTENSION_BRIDGE_PROBE_TIMEOUT_MS);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.origin !== webAppOrigin) return;
      if (isExtensionBridgePing(event.data)) return;
      if (!isExtensionBridgePong(event.data)) return;
      clearProbeTimeout();
      setConnection(connectionFromPong(event.data));
    };

    const probe = (options?: { refreshAuth?: boolean }) => {
      if (options?.refreshAuth) {
        setConnection((current) => clearedConnectionFields(current));
      }

      const ping = createExtensionBridgePing(generateUuid(), options);
      scheduleProbeTimeout();
      window.postMessage(ping, webAppOrigin);
    };

    retryRef.current = () => probe({ refreshAuth: true });

    window.addEventListener("message", handleMessage);

    // Prevent double probe from React Strict Mode effect double-fire in development
    if (!probeStartedRef.current) {
      probeStartedRef.current = true;
      probe();
    }

    return () => {
      retryRef.current = null;
      clearProbeTimeout();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const retry = useCallback(() => {
    retryRef.current?.();
  }, []);

  return { ...connection, retry };
}
