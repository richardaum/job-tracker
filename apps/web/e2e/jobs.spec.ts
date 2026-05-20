import { expect, test } from "@playwright/test";

type Job = { id: string; title: string; company: string; url: string | null };

test("authenticated user can create, edit, and delete a job", async ({
  page,
}) => {
  const user = {
    id: "user-e2e-1",
    email: "e2e@example.com",
    name: "E2E User",
    role: "user",
    avatarUrl: null,
  };

  const jobs: Job[] = [];

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

    if (operationName === "Jobs") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { jobs } }),
      });
      return;
    }

    if (operationName === "CreateJob") {
      const input = body.variables?.input as
        | { title: string; company: string; url?: string | null }
        | undefined;

      if (!input) {
        await route.abort();
        return;
      }

      const created: Job = {
        id: `job-${jobs.length + 1}`,
        title: input.title,
        company: input.company,
        url: input.url ?? null,
      };
      jobs.unshift(created);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { createJob: created } }),
      });
      return;
    }

    if (operationName === "UpdateJob") {
      const id = String(body.variables?.id ?? "");
      const input = body.variables?.input as
        | { title?: string; company?: string; url?: string | null }
        | undefined;

      const idx = jobs.findIndex((j) => j.id === id);
      if (idx === -1 || !input) {
        await route.abort();
        return;
      }

      jobs[idx] = { ...jobs[idx], ...input, url: input.url ?? null };

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { updateJob: jobs[idx] } }),
      });
      return;
    }

    if (operationName === "DeleteJob") {
      const id = String(body.variables?.id ?? "");
      const idx = jobs.findIndex((j) => j.id === id);
      if (idx !== -1) {
        jobs.splice(idx, 1);
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { deleteJob: true } }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: {} }),
    });
  });

  await page.goto("/jobs");
  await expect(
    page.getByRole("heading", { name: "Jobs", level: 1 }),
  ).toBeVisible();

  await page.getByRole("button", { name: "New job" }).click();
  await page.getByLabel("Job title").fill("Senior Frontend Engineer");
  await page.getByLabel("Company").fill("Acme Corp");
  await page.getByLabel("Job URL").fill("https://example.com/jobs/123");
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("Senior Frontend Engineer")).toBeVisible();
  await expect(page.getByText("Acme Corp")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: /Notifications/i })
      .getByText("Job created.", { exact: true }),
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
      .getByText("Job updated.", { exact: true }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Delete Staff Frontend Engineer" })
    .click();
  await page.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText("No jobs yet.")).toBeVisible();
  await expect(
    page.getByText("Add your first one to start tracking."),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: /Notifications/i })
      .getByText('"Staff Frontend Engineer" was deleted.', { exact: true }),
  ).toBeVisible();
});
