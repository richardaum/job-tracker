// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FieldValueService } from "@/domains/dom/field-value.service";
import type { ContentActionMessage } from "@/domains/message/types";
import type { CollectJobsAction } from "@job-tracker/plan-schemas";
import { StringTemplateService } from "@/domains/plan/services/string-template.service";
import { DefaultTimerService } from "@/domains/timer/timer.service";

import { JobsListService } from "./jobs-list.service";

import { SkippedJobReporterService } from "./skipped-job-reporter.service";
import { SurfaceCollectedReporterService } from "./surface-collected-reporter.service";

function mockSkippedReporter(): SkippedJobReporterService {
  return { reportSkipped: vi.fn() } as never;
}

function mockSurfaceCollectedReporter(): SurfaceCollectedReporterService {
  return { reportSurfaceCollected: vi.fn() } as never;
}

function makeBubble(mid: string, text: string, applyUrl?: string) {
  const div = document.createElement("div");
  div.classList.add("bubble", "channel-post");
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
  actionOverrides: { skipDelay?: boolean } = {},
): Extract<ContentActionMessage, { kind: "jobs.list" }> {
  const { surfaceFields: sf, ...rest } = overrides;
  const surfaceFields = sf ?? [
    { key: "text", selector: ".translatable-message", type: "property" as const, value: "innerText" as const },
  ];
  return {
    kind: "jobs.list",
    sourceRunId: "test-source-run",
    action: {
      kind: "collect.jobs",
      skipDelay: actionOverrides.skipDelay,
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
    Object.defineProperties(container, {
      scrollHeight: { value: 50, writable: true, configurable: true },
      clientHeight: { value: 50, writable: true, configurable: true },
    });
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
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const result = await svc.execute(buildMessage({ direction: "down" }));

    expect(result.jobs).toHaveLength(3);
    expect(result.jobs[0].text).toBe("first");
    expect(result.jobs[1].text).toBe("second");
    expect(result.jobs[2].text).toBe("third");
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
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const result = await svc.execute(buildMessage({ direction: "up" }));

    expect(result.jobs).toHaveLength(3);
    expect(result.jobs[0].text).toBe("third");
    expect(result.jobs[1].text).toBe("second");
    expect(result.jobs[2].text).toBe("first");
  });

  it("handles single item in container when direction=up", async () => {
    container.appendChild(makeBubble("1", "only"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const result = await svc.execute(buildMessage({ direction: "up" }));

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].text).toBe("only");
  });

  it("collects fields from each item", async () => {
    container.appendChild(makeBubble("42", "hello", "https://example.com/job"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const message = buildMessage({
      direction: "down",
      surfaceFields: [
        { key: "text", selector: ".translatable-message", type: "property" as const, value: "innerText" as const },
        { key: "applyUrl", selector: "a", type: "attribute" as const, value: "href" as const },
      ],
    });

    const result = await svc.execute(message);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]).toEqual({ text: "hello", applyUrl: "https://example.com/job" });
  });

  it("extracts cards from real Telegram HTML fixture", async () => {
    const html = readFileSync(resolve(__dirname, "../plan/fixtures/telegram-jsgurujobs.html"), "utf-8");

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
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const message = buildMessage(
      {
        containerSelector: ".bubbles-inner",
        itemSelector: ".bubble.channel-post",
        direction: "down",
        surfaceFields: [
          { key: "rawText", selector: ".translatable-message", type: "property" as const, value: "innerText" as const },
          {
            key: "applyUrl",
            selector:
              "a[href*='jobs'],a[href*='career'],a[href*='lever'],a[href*='greenhouse'],a[href*='ashby'],a[href*='workable']",
            type: "attribute" as const,
            value: "href" as const,
          },
        ],
      },
      { skipDelay: true },
    );
    const result = await svc.execute(message);

    // Should have at least 10 job cards (excluding date separators)
    expect(result.jobs.length).toBeGreaterThanOrEqual(10);

    // First card should have rawText and applyUrl
    expect(result.jobs[0].rawText).toBeTruthy();
    expect(typeof result.jobs[0].rawText).toBe("string");
    expect(result.jobs[0].rawText).toContain("🚀");

    // At least some cards should have an applyUrl
    const withUrl = result.jobs.filter((j) => j.applyUrl != null);
    expect(withUrl.length).toBeGreaterThan(0);
    expect(withUrl[0].applyUrl).toMatch(/^https?:\/\//);
  });

  it("readyCheck no-op when config is undefined", async () => {
    container.appendChild(makeBubble("1", "first"));
    container.appendChild(makeBubble("2", "second"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const result = await svc.execute(buildMessage({ direction: "down" }));

    expect(result.jobs).toHaveLength(2);
    expect(result.jobs[0].text).toBe("first");
    expect(result.jobs[1].text).toBe("second");
  });

  it("readyCheck silent when selector not found", async () => {
    container.appendChild(makeBubble("1", "first"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const result = await svc.execute(
      buildMessage({
        direction: "down",
        readyCheck: {
          selector: ".nonexistent",
          mode: "text",
          value: "updating",
          resolveTimeoutMs: 10_000,
          watchTimeoutMs: 3_000,
          pollIntervalMs: 200,
        } as const,
      }),
    );

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].text).toBe("first");
  });

  it("readyCheck waits for trigger text to resolve", async () => {
    const statusEl = document.createElement("div");
    statusEl.className = "input-search-placeholder";
    statusEl.textContent = "Updating...";
    document.body.appendChild(statusEl);

    setTimeout(() => {
      statusEl.textContent = "Ready";
    }, 50);

    container.appendChild(makeBubble("1", "first"));

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const msg = buildMessage({
      direction: "down",
      readyCheck: {
        selector: ".input-search-placeholder",
        mode: "text",
        value: "updating",
        resolveTimeoutMs: 2000,
        watchTimeoutMs: 3_000,
        pollIntervalMs: 20,
      } as const,
    });

    const result = await svc.execute(msg);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].text).toBe("first");
  });

  it("readyCheck runs only once per execute", async () => {
    for (let i = 0; i < 15; i++) {
      container.appendChild(makeBubble(String(i), `item-${i}`));
    }

    // Enable scrolling by overriding dimension properties
    Object.defineProperty(container, "scrollHeight", { value: 3000, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 300, configurable: true });

    const statusEl = document.createElement("div");
    statusEl.className = "input-search-placeholder";
    statusEl.textContent = "Ready";
    document.body.appendChild(statusEl);

    const waitForSpy = vi.spyOn(DefaultTimerService.prototype, "waitFor");

    const svc = new JobsListService(
      new FieldValueService(),
      new DefaultTimerService(),
      { publishDebug: vi.fn() } as never,
      new StringTemplateService(),
      mockSkippedReporter(),
      mockSurfaceCollectedReporter(),
    );

    const msg = buildMessage(
      {
        direction: "down",
        key: "{{text}}",
        readyCheck: {
          selector: ".input-search-placeholder",
          mode: "text",
          value: "updating",
          resolveTimeoutMs: 10_000,
          watchTimeoutMs: 300,
          pollIntervalMs: 10,
        } as const,
      },
      { skipDelay: true },
    );

    const result = await svc.execute(msg);

    expect(result.jobs).toHaveLength(15);
    // waitFor is only called from waitForReadyCheck — once means no per-scroll re-check
    expect(waitForSpy).toHaveBeenCalledTimes(1);
  });
});
