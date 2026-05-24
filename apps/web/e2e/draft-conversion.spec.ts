import { expect, test } from "@playwright/test";

test("paste HTML → job capture opens unified detail → automatic fill queued", async ({
  page,
}) => {
  await page.goto("/jobs");

  const title = `E2E Paste Test ${Date.now()}`;
  const html = `<html><body><h1>${title}</h1><p>React, TypeScript, Remote. $100k-$150k.</p></body></html>`;

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

  const dialog = page.getByRole("dialog", { name: "Paste detected" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(title)).toBeVisible();

  const autoConvert = dialog.getByRole("checkbox", {
    name: "Convert to job automatically",
  });
  await expect(autoConvert).toBeChecked();

  await dialog.getByRole("button", { name: "Create draft" }).click();

  await page.waitForURL(/\/jobs\/[a-f0-9-]+/, { timeout: 15000 });
  await expect(
    page.getByText("Automatic fill queued.", { exact: true }),
  ).toBeVisible({ timeout: 15000 });
});
