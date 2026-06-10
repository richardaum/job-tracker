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

async function createJobViaPaste(page: Page): Promise<string> {
  const title = `E2E Chat Test ${Date.now()}`;
  const html = `<html><body><h1>${title}</h1><p>React, TypeScript, Remote.</p></body></html>`;

  const pasteResponse = page.waitForResponse(async (resp) => {
    if (!resp.url().includes("/graphql") || resp.request().method() !== "POST") return false;
    const postData = resp.request().postData() ?? "";
    return postData.includes("CreateDraftCaptureJob");
  });

  await pasteJobHtml(page, html);

  const dialog = page.getByRole("dialog", { name: "Paste detected" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Create draft" }).click();

  const body = await (await pasteResponse).json();
  const jobId = body.data?.createJob?.id as string;
  expect(jobId).toBeTruthy();

  await page.waitForURL(/\/jobs\/[a-f0-9-]+/, { timeout: 15000 });
  return jobId;
}

test("chat tab renders with New Chat button on job details", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");
  const jobId = await createJobViaPaste(page);

  await page.goto(`/jobs/${jobId}/chat`);
  await page.waitForURL(/\/jobs\/[a-f0-9-]+\/chat/, { timeout: 15000 });

  await expect(page.getByRole("button", { name: "New Chat" })).toBeVisible();
  await expect(page.getByTestId("ai-chat-empty-state")).toBeVisible();
});

test("new conversation shows composer and send button", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");
  const jobId = await createJobViaPaste(page);

  await page.goto(`/jobs/${jobId}/chat`);
  await page.waitForURL(/\/jobs\/[a-f0-9-]+\/chat/, { timeout: 15000 });

  await page.getByRole("button", { name: "New Chat" }).click();

  const composerInput = page.getByPlaceholder("Ask a question...");
  await expect(composerInput).toBeVisible();
  await expect(composerInput).toBeEnabled();

  const sendButton = page.getByRole("button", { name: "Send" });
  await expect(sendButton).toBeDisabled();

  await composerInput.fill("What are the main requirements for this job?");
  await expect(sendButton).toBeEnabled();
});

test("send message creates conversation and shows user message", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");
  const jobId = await createJobViaPaste(page);

  await page.goto(`/jobs/${jobId}/chat`);
  await page.waitForURL(/\/jobs\/[a-f0-9-]+\/chat/, { timeout: 15000 });

  await page.getByRole("button", { name: "New Chat" }).click();

  const composerInput = page.getByPlaceholder("Ask a question...");
  await expect(composerInput).toBeVisible();

  const question = "Summarize this job in one sentence.";
  await composerInput.fill(question);
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText(question)).toBeVisible({ timeout: 30000 });

  const sendButton = page.getByRole("button", { name: "Send" });
  await expect(sendButton).toBeDisabled();
});

test("conversation list shows created conversation", async ({ page }) => {
  await loginWithAuthBypass(page, "/profile/settings");
  await ensureAutoFillSettingEnabled(page);

  await page.goto("/jobs");
  const jobId = await createJobViaPaste(page);

  await page.goto(`/jobs/${jobId}/chat`);
  await page.waitForURL(/\/jobs\/[a-f0-9-]+\/chat/, { timeout: 15000 });

  await page.getByRole("button", { name: "New Chat" }).click();

  const composerInput = page.getByPlaceholder("Ask a question...");
  await expect(composerInput).toBeVisible();

  await composerInput.fill("What skills are needed?");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("What skills are needed?")).toBeVisible({ timeout: 30000 });

  await page.getByRole("button", { name: "Back" }).click();

  const conversationItems = page.getByTestId("ai-chat-content").getByRole("button", { name: /Untitled|What skills/i });
  await expect(conversationItems.first()).toBeVisible({ timeout: 15000 });
});
