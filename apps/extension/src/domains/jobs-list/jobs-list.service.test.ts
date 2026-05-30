// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FieldValueService } from "@/domains/dom/field-value.service";
import type { ContentActionMessage } from "@/domains/message/types";
import type { CollectJobsAction } from "@/domains/plan/model/types";
import { StringTemplateService } from "@/domains/plan/services/string-template.service";
import { DefaultTimerService } from "@/domains/timer/timer.service";

import { JobsListService } from "./jobs-list.service";

function makeBubble(mid: string, text: string, applyUrl?: string) {
  const div = document.createElement("div");
  div.className = "bubble channel-post";
  div.setAttribute("data-mid", mid);
  const msg = document.createElement("div");
  msg.className = "translatable-message";
  msg.textContent = text;
  div.appendChild(msg);
  if (applyUrl) {
    const link = document.createElement("a");
    link.href = applyUrl;
    link.textContent = "Apply";
    div.appendChild(link);
  }
  return div;
}

function buildMessage(
  overrides: Partial<CollectJobsAction["input"]> = {},
): Extract<ContentActionMessage, { kind: "jobs.list" }> {
  const { surfaceFields: sf, ...rest } = overrides;
  const surfaceFields = sf ?? [
    {
      key: "text",
      selector: ".translatable-message",
      type: "property" as const,
      value: "innerText" as const,
    },
  ];
  return {
    kind: "jobs.list",
    action: {
      kind: "collect.jobs",
      input: {
        containerSelector: ".list",
        itemSelector: ".bubble.channel-post",
        detailsUrlField: "detailUrl",
        surfaceFields,
        detailsFields: [],
        parallelDetailsTabs: 1,
        direction: "down",
        ...rest,
      },
    },
  } as unknown as Extract<ContentActionMessage, { kind: "jobs.list" }>;
}

describe("JobsListService", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.className = "list";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("collects items top-to-bottom when direction=down", async () => {
    container.appendChild(makeBubble("1", "first"));
    container.appendChild(makeBubble("2", "second"));
    container.appendChild(makeBubble("3", "third"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
    );

    const result = await svc.execute(buildMessage({ direction: "down" }));

    expect(result).toHaveLength(3);
    expect(result[0].text).toBe("first");
    expect(result[1].text).toBe("second");
    expect(result[2].text).toBe("third");
  });

  it("collects items bottom-to-top when direction=up", async () => {
    container.appendChild(makeBubble("1", "first"));
    container.appendChild(makeBubble("2", "second"));
    container.appendChild(makeBubble("3", "third"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
    );

    const result = await svc.execute(buildMessage({ direction: "up" }));

    expect(result).toHaveLength(3);
    expect(result[0].text).toBe("third");
    expect(result[1].text).toBe("second");
    expect(result[2].text).toBe("first");
  });

  it("handles single item in container when direction=up", async () => {
    container.appendChild(makeBubble("1", "only"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
    );

    const result = await svc.execute(buildMessage({ direction: "up" }));

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe("only");
  });

  it("collects fields from each item", async () => {
    container.appendChild(makeBubble("42", "hello", "https://example.com/job"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
    );

    const message = buildMessage({
      direction: "down",
      surfaceFields: [
        {
          key: "text",
          selector: ".translatable-message",
          type: "property" as const,
          value: "innerText" as const,
        },
        {
          key: "applyUrl",
          selector: "a",
          type: "attribute" as const,
          value: "href" as const,
        },
      ],
    });

    const result = await svc.execute(message);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      text: "hello",
      applyUrl: "https://example.com/job",
    });
  });

  it("extracts cards from real Telegram HTML fixture", async () => {
    const html = readFileSync(
      resolve(__dirname, "../plan/fixtures/telegram-jsgurujobs.html"),
      "utf-8",
    );

    // Recreate the Telegram bubbles-inner structure inside container
    container.className = "bubbles-inner";
    container.innerHTML = html;

    // Simulate the scrollable wrapper that contains .bubbles-inner
    const scrollable = document.createElement("div");
    scrollable.className = "scrollable scrollable-y";
    container.parentElement!.insertBefore(scrollable, container);
    scrollable.appendChild(container);

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
    );

    const message = buildMessage({
      containerSelector: ".bubbles-inner",
      itemSelector: ".bubble.channel-post",
      direction: "down",
      surfaceFields: [
        {
          key: "rawText",
          selector: ".translatable-message",
          type: "property" as const,
          value: "innerText" as const,
        },
        {
          key: "applyUrl",
          selector:
            "a[href*='jobs'],a[href*='career'],a[href*='lever'],a[href*='greenhouse'],a[href*='ashby'],a[href*='workable']",
          type: "attribute" as const,
          value: "href" as const,
        },
      ],
    });

    const result = await svc.execute(message);

    // Should have at least 10 job cards (excluding date separators)
    expect(result.length).toBeGreaterThanOrEqual(10);

    // First card should have rawText and applyUrl
    expect(result[0].rawText).toBeTruthy();
    expect(typeof result[0].rawText).toBe("string");
    expect(result[0].rawText).toContain("🚀");

    // At least some cards should have an applyUrl
    const withUrl = result.filter((j) => j.applyUrl != null);
    expect(withUrl.length).toBeGreaterThan(0);
    expect(withUrl[0].applyUrl).toMatch(/^https?:\/\//);
  });
});
