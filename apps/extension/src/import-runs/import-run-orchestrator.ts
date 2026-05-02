import { getApiBaseUrl } from "../extension-channel/api-url";
import {
  buildApiCookieHeader,
  tryRefreshApiAccessToken,
} from "../extension-channel/auth-cookies";
import { EXTENSION_CHANNEL_EVENT_IMPORT_RUN_CREATED } from "../extension-channel/constants";
import { extensionGraphqlRequest } from "./extension-graphql-fetch";
import { writeImportQueueUiState } from "./import-queue-ui-state";
import { openImportRunTabOnce } from "./open-import-run-tab";

/** GraphQL serialization for `ImportRunStatus` (apps/api `schema.gql`). */
export type ApiImportRunStatus =
  | "RUNNING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

type PendingImportRun = { importRunId: string; entryUrl: string };

const IMPORT_RUNS_FOR_EXTENSION = `
query ExtensionImportRuns {
  importRuns {
    id
    entryUrl
    status
  }
}`;

const UPDATE_IMPORT_RUN_STATUS = `
mutation ExtensionUpdateImportRunStatus($id: ID!, $status: ImportRunStatus!) {
  updateImportRunStatus(id: $id, status: $status) {
    id
    status
  }
}`;

/** Runs picked up via pull reconnect (RUNNING); IN_PROGRESS survives disconnect until completed. */
function shouldEnqueueFromPull(status: ApiImportRunStatus): boolean {
  return status === "RUNNING" || status === "IN_PROGRESS";
}

/**
 * Pull + SSE share one queue; SSE notifications do not mutate runs — `createImportRun` already persists RUNNING.
 */
export class ImportRunOrchestrator {
  private readonly queuedIds = new Set<string>();
  private readonly queue: PendingImportRun[] = [];
  private tail: Promise<void> = Promise.resolve();
  private processorBusy = false;

  enqueueFromGraphql(
    kind: string,
    payloadJson: string | null | undefined,
  ): void {
    if (
      kind !== EXTENSION_CHANNEL_EVENT_IMPORT_RUN_CREATED ||
      payloadJson == null ||
      payloadJson.length === 0
    ) {
      return;
    }

    let parsed: { importRunId?: unknown; entryUrl?: unknown };
    try {
      parsed = JSON.parse(payloadJson) as {
        importRunId?: unknown;
        entryUrl?: unknown;
      };
    } catch {
      return;
    }

    if (
      typeof parsed.importRunId !== "string" ||
      typeof parsed.entryUrl !== "string"
    ) {
      return;
    }

    let url: URL;
    try {
      url = new URL(parsed.entryUrl);
    } catch {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return;
    }

    this.enqueueInternal({
      importRunId: parsed.importRunId,
      entryUrl: parsed.entryUrl,
    });
  }

  /** After the SSE handshake, load runs needing extension work so reconnect heals missed pushes. */
  async syncRunsFromPull(): Promise<void> {
    const apiBase = getApiBaseUrl();

    if ((await buildApiCookieHeader(apiBase)) == null) {
      return;
    }

    const res = await extensionGraphqlRequest<{
      importRuns: {
        id: string;
        entryUrl: string;
        status: ApiImportRunStatus;
      }[];
    }>(apiBase, { query: IMPORT_RUNS_FOR_EXTENSION });

    if (res.errors?.length || res.data?.importRuns == null) {
      await this.maybeRefreshAndRetryPull(apiBase);
      return;
    }

    for (const row of res.data.importRuns) {
      if (!shouldEnqueueFromPull(row.status)) {
        continue;
      }
      let url: URL;
      try {
        url = new URL(row.entryUrl);
      } catch {
        continue;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        continue;
      }
      this.enqueueInternal({ importRunId: row.id, entryUrl: row.entryUrl });
    }

    this.scheduleDrain();
  }

  private async maybeRefreshAndRetryPull(apiBase: string): Promise<void> {
    const refreshed = await tryRefreshApiAccessToken(apiBase);
    if (!refreshed || (await buildApiCookieHeader(apiBase)) == null) {
      return;
    }

    const res = await extensionGraphqlRequest<{
      importRuns: {
        id: string;
        entryUrl: string;
        status: ApiImportRunStatus;
      }[];
    }>(apiBase, { query: IMPORT_RUNS_FOR_EXTENSION });

    if (res.errors?.length || res.data?.importRuns == null) {
      return;
    }

    for (const row of res.data.importRuns) {
      if (!shouldEnqueueFromPull(row.status)) {
        continue;
      }
      try {
        const url = new URL(row.entryUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") continue;
      } catch {
        continue;
      }
      this.enqueueInternal({ importRunId: row.id, entryUrl: row.entryUrl });
    }

    this.scheduleDrain();
  }

  private enqueueInternal(run: PendingImportRun): void {
    const { importRunId } = run;
    if (this.queuedIds.has(importRunId)) {
      return;
    }
    this.queuedIds.add(importRunId);
    this.queue.push(run);
    void this.persistQueueUiSnapshot();
    this.scheduleDrain();
  }

  private async persistQueueUiSnapshot(): Promise<void> {
    await writeImportQueueUiState({
      queuedCount: this.queue.length,
      processorStatus: this.processorBusy ? "busy" : "idle",
    });
  }

  private scheduleDrain(): void {
    this.tail = this.tail.then(async () => {
      await this.drainSequential();
    });
  }

  private async drainSequential(): Promise<void> {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item === undefined) {
        break;
      }
      const { importRunId } = item;
      this.queuedIds.delete(importRunId);
      this.processorBusy = true;
      await this.persistQueueUiSnapshot();
      try {
        await this.processOne(item);
      } catch {
        /** Swallow — next item proceeds; statuses may stay partial until pull retry. */
      } finally {
        this.processorBusy = false;
        await this.persistQueueUiSnapshot();
      }
    }
  }

  private async processOne(run: PendingImportRun): Promise<void> {
    const apiBase = getApiBaseUrl();
    if ((await buildApiCookieHeader(apiBase)) == null) {
      return;
    }

    const progressed = await this.mutateImportRunStatus(
      apiBase,
      run.importRunId,
      "IN_PROGRESS",
    );
    if (!progressed) {
      return;
    }

    await openImportRunTabOnce(run.importRunId, run.entryUrl);

    await this.mutateImportRunStatus(apiBase, run.importRunId, "COMPLETED");
  }

  private async mutateImportRunStatus(
    apiBase: string,
    id: string,
    status: "IN_PROGRESS" | "COMPLETED",
  ): Promise<boolean> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const res = await extensionGraphqlRequest<{
        updateImportRunStatus?: { status: ApiImportRunStatus };
      }>(apiBase, {
        query: UPDATE_IMPORT_RUN_STATUS,
        variables: { id, status },
      });

      const unauthorized =
        res.errors?.some((e) => /unauthoriz/i.test(e.message)) ?? false;
      if (
        unauthorized &&
        attempt === 0 &&
        (await tryRefreshApiAccessToken(apiBase))
      ) {
        continue;
      }

      const hardFail =
        res.errors?.some(
          (e) =>
            /invalid import run transition/i.test(e.message) ||
            /not found/i.test(e.message),
        ) ?? false;

      if (hardFail) {
        return false;
      }

      if (!res.errors?.length && res.data?.updateImportRunStatus != null) {
        return true;
      }

      if (attempt === 1 || !res.errors?.length) {
        return false;
      }
    }
    return false;
  }
}

/** Shared SW instance; integration tests instantiate {@link ImportRunOrchestrator} directly. */
export const importRunOrchestrator = new ImportRunOrchestrator();
