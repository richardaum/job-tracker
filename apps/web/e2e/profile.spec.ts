import { expect, test } from "@playwright/test";

import { loginWithAuthBypass } from "./helpers/auth-bypass";

test("profile page renders 4 tabs after login", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile");

  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Identity" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Resumes" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Work Preferences" })).toBeVisible();
});

test("settings tab renders and toggles work", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");

  await expect(page.getByText("Auto-fill job fields")).toBeVisible();
  await expect(page.getByText("Auto-summary")).toBeVisible();
  await expect(page.getByText("Duplicate detection window")).toBeVisible();

  const spinbutton = page.getByRole("spinbutton");
  await expect(spinbutton).toHaveValue("30");
});

test("sidebar user card navigates to profile", async ({ page }) => {
  await loginWithAuthBypass(page, "/jobs");

  const userCard = page.getByRole("link", { name: /Richard Lopes/ });
  await expect(userCard).toHaveAttribute("href", "/profile");

  await userCard.click();
  await page.waitForURL(/\/profile$/, { timeout: 15000 });
  await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
});

test("sidebar settings link goes to profile settings", async ({ page }) => {
  await loginWithAuthBypass(page, "/jobs");

  const settingsLink = page.getByRole("link", { name: "Settings" });
  await expect(settingsLink).toHaveAttribute("href", "/profile/settings");
});

test("sidebar has no resumes nav item", async ({ page }) => {
  await loginWithAuthBypass(page, "/jobs");

  await expect(page.getByRole("link", { name: "Resumes" })).not.toBeAttached();
});

test("old /resumes route returns not-found", async ({ page }) => {
  await loginWithAuthBypass(page, "/jobs");
  await page.goto("/resumes");

  await expect(page.getByText(/not found|404/i)).toBeVisible();
});
