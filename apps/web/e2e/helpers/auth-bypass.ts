import "@/env/load-dotenv";

import type { Page } from "@playwright/test";

import { e2eEnv } from "@/env/e2e";

function getApiBaseUrl(): string {
  const url = e2eEnv.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL not set — configure it in apps/web/.env or .env.local for E2E auth bypass.");
  }

  return url.replace(/\/$/, "");
}

/** Dev auth bypass via API origin (same flow as the login page Google button). */
export async function loginWithAuthBypass(page: Page, returnTo: string): Promise<void> {
  const apiUrl = getApiBaseUrl();
  await page.goto(`${apiUrl}/auth/google?returnTo=${encodeURIComponent(returnTo)}`);
  await page.waitForURL((url) => new URL(url).pathname === returnTo, { timeout: 15000 });
}
