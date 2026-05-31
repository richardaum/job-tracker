import { tryRun } from "@job-tracker/try-run";
import { existsSync, mkdirSync } from "fs";
import { appendFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

import { serverEnv } from "@/env/server";

const DEBUG_LOG_PATH = path.resolve(process.cwd(), "../../.claude/debug.log");

export async function POST(request: Request) {
  if (serverEnv.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await request.json();
  const line =
    typeof body === "object" && body !== null
      ? JSON.stringify(body)
      : String(body);
  const dir = DEBUG_LOG_PATH.substring(0, DEBUG_LOG_PATH.lastIndexOf("/"));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const [err] = await tryRun(
    appendFile(DEBUG_LOG_PATH, `${new Date().toISOString()} ${line}\n`),
  );
  if (err) {
    console.error("[debug-log] write error", err);
  }
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}

export async function OPTIONS() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
}
