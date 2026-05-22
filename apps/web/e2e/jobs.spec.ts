import { expect, test } from "@playwright/test";

test("jobs list page renders", async ({ page }) => {
  await page.goto("http://localhost:3104/auth/google?returnTo=/jobs");
  await page.waitForURL(/\/jobs/, { timeout: 15000 });
  await expect(page.getByRole("button", { name: "New job" })).toBeVisible();
});

test("draft jobs list page renders", async ({ page }) => {
  await page.goto("http://localhost:3104/auth/google?returnTo=/draft-jobs");
  await page.waitForURL(/\/draft-jobs/, { timeout: 15000 });
  await expect(
    page.getByRole("textbox", { name: "Search drafts..." }),
  ).toBeVisible();
});

test("matches page renders", async ({ page }) => {
  await page.goto("http://localhost:3104/auth/google?returnTo=/matches");
  await page.waitForURL(/\/matches/, { timeout: 15000 });
  await expect(page.getByText("Job Tracker").first()).toBeVisible();
});
