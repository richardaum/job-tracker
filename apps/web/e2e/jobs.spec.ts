import { expect, test } from "@playwright/test";

test("jobs list page renders", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("button", { name: "New job" })).toBeVisible();
});

test("draft jobs filter on jobs list renders", async ({ page }) => {
  await page.goto("/jobs?q=draft");
  await expect(page).toHaveURL(/[?&]q=draft/);
  await expect(
    page.getByRole("textbox", { name: "Search jobs..." }),
  ).toBeVisible();
});

test("legacy match URL redirects to job Match tab", async ({ page }) => {
  await page.goto("/matches/e2e-legacy-job-id");

  await expect(page).toHaveURL(/\/jobs\/e2e-legacy-job-id\/match(\?|$)/);
});
