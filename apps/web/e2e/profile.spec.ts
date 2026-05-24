import { expect, test } from "@playwright/test";

test("profile page renders 4 tabs after login", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/profile");
  await page.waitForURL(/\/profile/, { timeout: 15000 });

  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Identity" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Resumes" })).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Work Preferences" }),
  ).toBeVisible();
});

test("settings tab renders and toggles work", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/profile/settings");
  await page.waitForURL(/\/profile\/settings/, { timeout: 15000 });

  await expect(page.getByText("Auto-fill")).toBeVisible();
  await expect(page.getByText("Auto-summary")).toBeVisible();
  await expect(page.getByText("Duplicate detection window")).toBeVisible();

  const spinbutton = page.getByRole("spinbutton");
  await expect(spinbutton).toHaveValue("30");
});

test("sidebar user card navigates to profile", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/jobs");
  await page.waitForURL(/\/jobs/, { timeout: 15000 });

  const userCard = page.getByRole("link", { name: /Richard Lopes/ });
  await expect(userCard).toHaveAttribute("href", "/profile");

  await userCard.click();
  await page.waitForURL(/\/profile/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
});

test("sidebar settings link goes to profile settings", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/jobs");
  await page.waitForURL(/\/jobs/, { timeout: 15000 });

  const settingsLink = page.getByRole("link", { name: "Settings" });
  await expect(settingsLink).toHaveAttribute("href", "/profile/settings");
});

test("sidebar has no resumes nav item", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/jobs");
  await page.waitForURL(/\/jobs/, { timeout: 15000 });

  await expect(page.getByRole("link", { name: "Resumes" })).not.toBeAttached();
});

test("old /resumes route returns not-found", async ({ page }) => {
  await page.goto("/auth/google?returnTo=/resumes");
  await page.waitForURL(/\/resumes/, { timeout: 15000 });

  await expect(page.getByText(/not found|404/i)).toBeVisible();
});
