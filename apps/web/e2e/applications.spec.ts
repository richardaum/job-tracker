import { expect, test } from "@playwright/test";

type Application = {
  id: string;
  title: string;
  company: string;
  url: string | null;
};

test("authenticated user can create, edit, and delete an application", async ({
  page,
}) => {
  const user = {
    id: "user-e2e-1",
    email: "e2e@example.com",
    name: "E2E User",
    role: "user",
    avatarUrl: null,
  };

  const applications: Application[] = [];

  await page.route("**/graphql", async (route) => {
    const request = route.request();
    const body = request.postDataJSON() as {
      operationName?: string;
      variables?: Record<string, unknown>;
    };

    const operationName = body.operationName;

    if (operationName === "Me") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { me: user } }),
      });
      return;
    }

    if (operationName === "Applications") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { applications } }),
      });
      return;
    }

    if (operationName === "CreateApplication") {
      const input = body.variables?.input as
        | { title: string; company: string; url?: string | null }
        | undefined;

      if (!input) {
        await route.abort();
        return;
      }

      const created: Application = {
        id: `app-${applications.length + 1}`,
        title: input.title,
        company: input.company,
        url: input.url ?? null,
      };
      applications.unshift(created);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { createApplication: created } }),
      });
      return;
    }

    if (operationName === "UpdateApplication") {
      const id = String(body.variables?.id ?? "");
      const input = body.variables?.input as
        | { title?: string; company?: string; url?: string | null }
        | undefined;

      const idx = applications.findIndex((app) => app.id === id);
      if (idx === -1 || !input) {
        await route.abort();
        return;
      }

      applications[idx] = {
        ...applications[idx],
        ...input,
        url: input.url ?? null,
      };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { updateApplication: applications[idx] },
        }),
      });
      return;
    }

    if (operationName === "DeleteApplication") {
      const id = String(body.variables?.id ?? "");
      const idx = applications.findIndex((app) => app.id === id);
      if (idx !== -1) {
        applications.splice(idx, 1);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { deleteApplication: true } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto("/applications");
  await expect(
    page.getByRole("heading", { name: "Applications", level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Manual application" }).click();
  await page.getByLabel("Job title").fill("Senior Frontend Engineer");
  await page.getByLabel("Company").fill("Acme Corp");
  await page.getByLabel("Job URL").fill("https://example.com/jobs/123");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Senior Frontend Engineer")).toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: /Notifications/i })
      .getByText("Application created.", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Edit Senior Frontend Engineer" })
    .click();
  await page.getByLabel("Job title").fill("Staff Frontend Engineer");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Staff Frontend Engineer")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: /Notifications/i })
      .getByText("Application updated.", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Delete Staff Frontend Engineer" })
    .click();
  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText("No applications yet.")).toBeVisible();
  await expect(
    page.getByText("Add your first one to start tracking."),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: /Notifications/i })
      .getByText('"Staff Frontend Engineer" was deleted.', { exact: true }),
  ).toBeVisible();
});
