import { NextResponse } from "next/server";

import { serverEnv } from "@/env/server";

export const dynamic = "force-dynamic";

export function GET() {
  const commitSha = serverEnv.VERCEL_GIT_COMMIT_SHA ?? null;

  return NextResponse.json({
    name: "newjobtracker",
    version: commitSha ?? "unknown",
    commitSha,
    deployedAt: serverEnv.NEXT_DEPLOYED_AT ?? null,
    environment: serverEnv.VERCEL_ENV ?? serverEnv.NODE_ENV,
    deploymentId: serverEnv.VERCEL_DEPLOYMENT_ID ?? null,
  });
}
