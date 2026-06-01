import type { ExtensionBridgeStatus } from "@/domains/web-bridge/extension-bridge.protocol";

export type AdminGetStatusMessage = { kind: "admin.get-status"; webAppOrigin: string; refreshAuth?: boolean };

type ExtensionAuthSnapshot = Pick<ExtensionBridgeStatus, "authStatus" | "authenticatedEmail">;

type AdminExtensionStatusDeps = { fetchAuthenticatedEmail: () => Promise<string | null> };

const AUTH_CACHE_MS = 60_000;

export class AdminExtensionStatusService {
  private authCache: { resolvedAt: number; snapshot: ExtensionAuthSnapshot } | null = null;

  constructor(private readonly deps: AdminExtensionStatusDeps) {}

  async getStatus(webAppOrigin: string, options?: { refreshAuth?: boolean }): Promise<ExtensionBridgeStatus> {
    const auth = await this.resolveAuth(options?.refreshAuth ?? false);

    return {
      extensionVersion: chrome.runtime.getManifest().version,
      browser: navigator.userAgent,
      lastHeartbeatAt: new Date().toISOString(),
      webAppOrigin,
      ...auth,
    };
  }

  async handleGetStatusMessage(message: unknown): Promise<ExtensionBridgeStatus> {
    const parsed = parseAdminGetStatusMessage(message);
    return this.getStatus(parsed.webAppOrigin, { refreshAuth: parsed.refreshAuth });
  }

  private async resolveAuth(forceRefresh: boolean): Promise<ExtensionAuthSnapshot> {
    if (forceRefresh) {
      this.authCache = null;
    }

    const cached = this.authCache;
    if (cached && Date.now() - cached.resolvedAt < AUTH_CACHE_MS) {
      return cached.snapshot;
    }

    const email = await this.deps.fetchAuthenticatedEmail();
    if (!email) {
      return this.cacheAuth({ authStatus: "unauthenticated", authenticatedEmail: null });
    }

    return this.cacheAuth({ authStatus: "authenticated", authenticatedEmail: email });
  }

  private cacheAuth(snapshot: ExtensionAuthSnapshot): ExtensionAuthSnapshot {
    this.authCache = { resolvedAt: Date.now(), snapshot };
    return snapshot;
  }
}

export function parseAdminGetStatusMessage(message: unknown): { webAppOrigin: string; refreshAuth?: boolean } {
  if (typeof message !== "object" || message == null) {
    return { webAppOrigin: "" };
  }

  const record = message as Record<string, unknown>;
  const webAppOrigin = "webAppOrigin" in record && typeof record.webAppOrigin === "string" ? record.webAppOrigin : "";

  return { webAppOrigin, ...(record.refreshAuth === true ? { refreshAuth: true } : {}) };
}

export function parseWebAppOrigin(message: unknown): string {
  return parseAdminGetStatusMessage(message).webAppOrigin;
}
