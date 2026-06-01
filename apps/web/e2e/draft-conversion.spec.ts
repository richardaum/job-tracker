import { expect, type Page, test } from "@playwright/test";

import { loginWithAuthBypass } from "./helpers/auth-bypass";

function getAutoFillSettingSwitch(page: Page) {
  return page
    .locator("div")
    .filter({ has: page.getByText("Auto-fill job fields", { exact: true }) })
    .filter({ has: page.getByRole("switch") })
    .getByRole("switch");
}

async function ensureAutoFillSettingEnabled(page: Page) {
  const autoFillSwitch = getAutoFillSettingSwitch(page);
  if (!(await autoFillSwitch.isChecked())) {
    await autoFillSwitch.click();
    await expect(autoFillSwitch).toBeChecked();
  }
}

async function pasteJobHtml(page: Page, html: string) {
  await page.evaluate(
    ({ html }) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("text/html", html);
      dataTransfer.setData("text/plain", html);

      const pasteEvent = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dataTransfer });

      document.body.dispatchEvent(pasteEvent);
    },
    { html },
  );
}

async function waitForCreateDraftCaptureJobResponse(page: Page) {
  const response = await page.waitForResponse(async (resp) => {
    if (!resp.url().includes("/graphql") || resp.request().method() !== "POST") {
      return false;
    }

    const postData = resp.request().postData() ?? "";
    return postData.includes("CreateDraftCaptureJob");
  });

  return response.json() as Promise<{
    data?: { createJob?: { id: string; fillMetadata?: { status?: string | null } | null } };
  }>;
}

test("paste HTML → draft created with server-side auto-fill when enabled", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");

  const title = `E2E Paste Test ${Date.now()}`;
  const html = `<html><body><h1>${title}</h1><p>React, TypeScript, Remote. $100k-$150k.</p></body></html>`;

  const createJobResponse = waitForCreateDraftCaptureJobResponse(page);
  await pasteJobHtml(page, html);

  const dialog = page.getByRole("dialog", { name: "Paste detected" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(title)).toBeVisible();

  const autoFillCheckbox = dialog.getByRole("checkbox", { name: "Fill job fields automatically" });
  await expect(autoFillCheckbox).toBeChecked();

  await dialog.getByRole("button", { name: "Create draft" }).click();

  const body = await createJobResponse;
  expect(body.data?.createJob?.fillMetadata?.status).toBe("PROCESSING");

  await page.waitForURL(/\/jobs\/[a-f0-9-]+/, { timeout: 15000 });
  expect(page.url()).not.toContain("autoConvert");
});

test("paste HTML → draft created without auto-fill when checkbox unchecked", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");

  const title = `E2E Paste No Fill ${Date.now()}`;
  const html = `<html><body><h1>${title}</h1><p>React, TypeScript, Remote. $100k-$150k.</p></body></html>`;

  const createJobResponse = waitForCreateDraftCaptureJobResponse(page);
  await pasteJobHtml(page, html);

  const dialog = page.getByRole("dialog", { name: "Paste detected" });
  await expect(dialog).toBeVisible();

  const autoFillCheckbox = dialog.getByRole("checkbox", { name: "Fill job fields automatically" });
  await expect(autoFillCheckbox).toBeChecked();
  await autoFillCheckbox.click();
  await expect(autoFillCheckbox).not.toBeChecked();

  await dialog.getByRole("button", { name: "Create draft" }).click();

  const body = await createJobResponse;
  expect(body.data?.createJob?.id).toBeTruthy();
  const fillStatus = body.data?.createJob?.fillMetadata?.status;
  expect(fillStatus == null || fillStatus !== "PROCESSING").toBe(true);

  await page.waitForURL(/\/jobs\/[a-f0-9-]+/, { timeout: 15000 });

  const actionsButton = page.getByRole("button", { name: "Actions" });
  await expect(actionsButton).toBeVisible();
  await actionsButton.click();
  await expect(page.getByRole("menuitem", { name: "Fill job fields automatically" })).toBeEnabled();
});
