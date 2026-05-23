import { expect, test } from "@playwright/test";

test("jobs list page renders", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/jobs");
  await page.waitForURL(/\/jobs/, { timeout: 15000 });
  await expect(page.getByRole("button", { name: "New job" })).toBeVisible();
});

test("draft jobs filter on jobs list renders", async ({ page }) => {
  const returnTo = encodeURIComponent("/jobs?q=draft");
  await page.goto(`/auth/google?returnTo=${returnTo}`);
  await page.waitForURL(/\/jobs/, { timeout: 15000 });
  await expect(page).toHaveURL(/[?&]q=draft/);
  await expect(
    page.getByRole("textbox", { name: "Search jobs..." }),
  ).toBeVisible();
});

test("matches page renders", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/matches");
  await page.waitForURL(/\/matches/, { timeout: 15000 });
  await expect(page.getByText("Job Tracker").first()).toBeVisible();
});
