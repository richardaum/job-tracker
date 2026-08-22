import "@/env/load-dotenv";

import type { Page } from "@playwright/test";

/** SessionAuthGuard handles AUTH_BYPASS_ENABLED directly; no auth endpoint is needed. */
export async function loginWithAuthBypass(page: Page, returnTo: string): Promise<void> {
  await page.goto(returnTo);
}
