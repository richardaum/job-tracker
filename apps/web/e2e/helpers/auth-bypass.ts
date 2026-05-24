import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Page } from "@playwright/test";

function parseEnvValue(raw: string): string {
  const trimmed = raw.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function readApiUrlFromFile(filename: string): string | undefined {
  const envPath = join(process.cwd(), filename);
  if (!existsSync(envPath)) {
    return undefined;
  }

  const match = readFileSync(envPath, "utf8").match(
    /^NEXT_PUBLIC_API_URL=(.+)$/m,
  );
  if (!match?.[1]) {
    return undefined;
  }

  return parseEnvValue(match[1]).replace(/\/$/, "");
}

function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  // Next.js precedence: .env.local overrides .env (E2E setup writes .env.local on main).
  const fromLocal = readApiUrlFromFile(".env.local");
  if (fromLocal) {
    return fromLocal;
  }

  const fromDotEnv = readApiUrlFromFile(".env");
  if (fromDotEnv) {
    return fromDotEnv;
  }

  throw new Error(
    "NEXT_PUBLIC_API_URL not found — set it in apps/web/.env.local or apps/web/.env for E2E auth bypass.",
  );
}

/** Dev auth bypass via API origin (same flow as the login page Google button). */
export async function loginWithAuthBypass(
  page: Page,
  returnTo: string,
): Promise<void> {
  const apiUrl = getApiBaseUrl();
  await page.goto(
    `${apiUrl}/auth/google?returnTo=${encodeURIComponent(returnTo)}`,
  );
  await page.waitForURL((url) => new URL(url).pathname === returnTo, {
    timeout: 15000,
  });
}
