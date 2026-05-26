import { tryRun } from "@job-tracker/try-run";

const WEB_URL = import.meta.env.WXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

export async function debugLog(entry: Record<string, unknown>): Promise<void> {
  await tryRun(
    fetch(`${WEB_URL}/api/debug-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, source: "extension" }),
    }),
  );
}
