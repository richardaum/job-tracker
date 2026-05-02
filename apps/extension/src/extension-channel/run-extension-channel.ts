import { type Client, createClient } from "graphql-sse";

import { importRunOrchestrator } from "../import-runs/import-run-orchestrator";
import { getApiBaseUrl, getGraphqlSseUrl } from "./api-url";
import { buildApiCookieHeader, tryRefreshApiAccessToken } from "./auth-cookies";
import { writeChannelState } from "./channel-state";
import { EXTENSION_CHANNEL_SUBSCRIPTION } from "./constants";
import { handleExtensionChannelGraphqlEvent } from "./handle-extension-channel-events";
import { appendExtensionChannelSseLogEntry } from "./sse-event-log";

const RECONNECT_MS = 8_000;

type ExtensionChannelEventPayload = {
  kind?: string;
  payloadJson?: string | null;
};

type ExtensionChannelSubscriptionData = {
  extensionChannel?: ExtensionChannelEventPayload;
};

type ErrorWithResponseStatus = { response?: { status?: number } };

type SubscriptionRunOutcome = "auth" | "retry";

/**
 * Maintains an authenticated GraphQL-over-SSE subscription to the API (same session as the web app).
 */
class ExtensionGraphqlChannel {
  private streamingClient: Client | undefined;
  private runId = 0;

  start(): void {
    this.runId += 1;
    const id = this.runId;
    this.streamingClient?.dispose();
    this.streamingClient = undefined;

    void this.maintain(id);
  }

  private stopIfStale(id: number): boolean {
    return id !== this.runId;
  }

  private async maintain(id: number): Promise<void> {
    for (;;) {
      if (this.stopIfStale(id)) {
        return;
      }
      const outcome = await this.runSubscriptionOnce(id);
      if (outcome === "auth") {
        return;
      }
      if (this.stopIfStale(id)) {
        return;
      }
      await new Promise((r) => setTimeout(r, RECONNECT_MS));
    }
  }

  private async runSubscriptionOnce(
    id: number,
  ): Promise<SubscriptionRunOutcome> {
    const apiBase = getApiBaseUrl();

    await writeChannelState({ status: "connecting", lastError: undefined });

    if ((await buildApiCookieHeader(apiBase)) == null) {
      await writeChannelState({
        status: "auth_required",
        lastError: "Sign in to Job Tracker in this browser.",
      });
      return "auth";
    }

    for (let attempt = 0; attempt < 2; attempt++) {
      if (this.stopIfStale(id)) {
        return "retry";
      }

      const sseUrl = getGraphqlSseUrl();

      const client = createClient({
        url: sseUrl,
        /** Browser fetch forbids the `Cookie` header; rely on the API cookie jar. */
        credentials: "include",
        retryAttempts: 0,
      });

      this.streamingClient = client;

      try {
        const iterable = client.iterate({
          query: EXTENSION_CHANNEL_SUBSCRIPTION,
        });

        await writeChannelState({ status: "streaming", lastError: undefined });

        /** Do not block SSE consumption on pull; pull uses a separate `/graphql` fetch (can hang without AbortSignal). */
        void importRunOrchestrator.syncRunsFromPull().catch(() => {
          /** pull is best-effort; SSE + later reconnects refill state */
        });

        for await (const result of iterable) {
          if (this.stopIfStale(id)) {
            break;
          }

          if (result.errors?.length) {
            const msg = result.errors.map((e) => e.message).join("; ");
            const unauthorized = result.errors.some((e) =>
              /unauthoriz/i.test(e.message),
            );
            await writeChannelState({
              status: unauthorized ? "auth_required" : "error",
              lastError: msg,
            });
            return unauthorized ? "auth" : "retry";
          }

          const payload = result.data as
            | ExtensionChannelSubscriptionData
            | undefined;
          const ev = payload?.extensionChannel;
          if (ev?.kind != null) {
            await writeChannelState({
              status: "streaming",
              lastEventKind: ev.kind,
              lastError: undefined,
            });
            await appendExtensionChannelSseLogEntry(ev.kind, ev.payloadJson);
            handleExtensionChannelGraphqlEvent(ev.kind, ev.payloadJson);
          }
        }
      } catch (e) {
        if (this.stopIfStale(id)) {
          return "retry";
        }
        const msg = e instanceof Error ? e.message : String(e);
        const network = e as ErrorWithResponseStatus;
        const status = network.response?.status;
        const needsLogin =
          status === 401 ||
          /401/.test(msg) ||
          /Unauthorized/i.test(msg) ||
          /Unauthorized/i.test(String(e));

        const canRetryWithRefresh =
          needsLogin &&
          attempt === 0 &&
          (await tryRefreshApiAccessToken(apiBase));
        if (canRetryWithRefresh) {
          const next = await buildApiCookieHeader(apiBase);
          if (next != null) {
            await writeChannelState({
              status: "connecting",
              lastError: undefined,
            });
            continue;
          }
        }

        await writeChannelState({
          status: needsLogin ? "auth_required" : "error",
          lastError: msg,
        });
        return needsLogin ? "auth" : "retry";
      } finally {
        client.dispose();
        if (this.streamingClient === client) {
          this.streamingClient = undefined;
        }
      }

      return "retry";
    }

    return "retry";
  }
}

export const extensionGraphqlChannel = new ExtensionGraphqlChannel();
