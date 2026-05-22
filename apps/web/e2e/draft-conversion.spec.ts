import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(`http://localhost:3104/auth/google?returnTo=/draft-jobs`);
  await page.waitForURL(/\/draft-jobs/, { timeout: 15000 });
});

test("paste HTML → create draft with auto-convert → status Succeeded", async ({
  page,
}) => {
  const title = `E2E Paste Test ${Date.now()}`;
  const html = `<html><body><h1>${title}</h1><p>React, TypeScript, Remote. $100k-$150k.</p></body></html>`;

  // Trigger paste event with HTML content
  await page.evaluate(
    ({ html }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/html", html);
      dataTransfer.setData("text/plain", html);

      const pasteEvent = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
      });

      document.body.dispatchEvent(pasteEvent);
    },
    { html },
  );

  // Paste dialog should appear
  const dialog = page.getByRole("dialog", { name: "Paste detected" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(html)).toBeVisible();

  // Auto-convert should be checked by default
  const autoConvert = dialog.getByRole("checkbox", {
    name: "Convert to job automatically",
  });
  await expect(autoConvert).toBeChecked();

  // Click Create draft (navigates to draft detail page)
  await dialog.getByRole("button", { name: "Create draft" }).click();

  // Should navigate to draft detail page
  await page.waitForURL(/\/draft-jobs\/[a-f0-9-]+/, { timeout: 15000 });
  await page.waitForTimeout(1000);

  // Verify Succeeded status and title
  await expect(page.getByText("Succeeded")).toBeVisible();
  await expect(
    page.locator("h1").filter({ hasText: "Succeeded" }),
  ).toBeVisible();

  // Verify a linked job was created
  const jobLink = page.locator('a[href*="/jobs/"]');
  await expect(jobLink.first()).toBeVisible();
});
