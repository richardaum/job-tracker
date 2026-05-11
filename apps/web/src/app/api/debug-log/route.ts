import { appendFileSync } from "node:fs";

import { tryRun } from "@job-tracker/try-run";

const DEBUG_LOG = "/Users/richardaum/projects/job-tracker/.claude/debug.log";

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const [err] = tryRun(() => appendFileSync(DEBUG_LOG, body, "utf-8"));
  return new Response(err ? "fail" : "ok", { status: err ? 500 : 200 });
}
