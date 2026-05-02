import { importRunOrchestrator } from "../import-runs/import-run-orchestrator";

/**
 * SSE payloads are queued only (`import-run-orchestrator`); pull-on-connect covers missed pushes.
 * Import run statuses are mutated only when draining the queue (`IN_PROGRESS` → tab → `COMPLETED`).
 */
export function handleExtensionChannelGraphqlEvent(
  kind: string,
  payloadJson: string | null | undefined,
): void {
  importRunOrchestrator.enqueueFromGraphql(kind, payloadJson);
}
