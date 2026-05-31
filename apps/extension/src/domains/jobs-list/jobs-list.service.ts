import { tryRun } from "@job-tracker/try-run";

import { FieldValueService } from "@/domains/dom/field-value.service";
import type { Job } from "@/domains/dom/types";
import { PopupLogService } from "@/domains/log/popup-log.service";
import type { ContentActionMessage } from "@/domains/message/types";
import type {
  PlanStepCollectJobsSurfaceField,
  RegexSurfaceField,
} from "@/domains/plan/model/types";
import { StringTemplateService } from "@/domains/plan/services/string-template.service";
import { TimerService } from "@/domains/timer/timer.service";

const MAX_JOBS_COLLECT = 50;
const SCROLLABLE_CHECK_ATTRS = ["overflow-y", "overflow"] as const;

function findScrollableAncestor(el: Element): Element | null {
  let current: Element | null = el;
  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const style = getComputedStyle(current);
    for (const attr of SCROLLABLE_CHECK_ATTRS) {
      const val = style.getPropertyValue(attr);
      if (val === "auto" || val === "scroll") return current;
    }
    current = current.parentElement;
  }
  return null;
}
const BATCH_WAIT_MS = 300;

export class JobsListService {
  constructor(
    private readonly fieldValueService: FieldValueService,
    private readonly timerService: TimerService,
    private readonly popupLogService: PopupLogService,
    private readonly stringTemplateService: StringTemplateService,
  ) {}

  async execute(message: Extract<ContentActionMessage, { kind: "jobs.list" }>) {
    const { input, skipDelay } = message.action;
    const direction = input.direction ?? "down";

    const container = await this.waitForSelector(
      input.containerSelector,
      input.itemSelector,
      30_000,
    );
    if (!container) {
      throw new Error(
        `Failed to load page content: expected container "${input.containerSelector}" not found after 30s. The page may have changed or requires login.`,
      );
    }

    let scrollable =
      findScrollableAncestor(container) ?? container.parentElement ?? container;
    if (
      scrollable === document.body ||
      scrollable === document.documentElement
    ) {
      scrollable = container;
    }

    // Initial scroll: bottom for "up" (newest first), top for "down"
    if (scrollable) {
      scrollable.scrollTop = direction === "up" ? scrollable.scrollHeight : 0;
      await new Promise((r) => setTimeout(r, BATCH_WAIT_MS));
    }

    const collected: Job[] = [];
    const seen = new Set<string>();
    let emptyPasses = 0;

    while (collected.length < MAX_JOBS_COLLECT && emptyPasses < 5) {
      const items = container.querySelectorAll(input.itemSelector);
      let foundNew = false;

      if (items.length > 0 && collected.length >= items.length) break;

      if (direction === "up") {
        for (let i = items.length - 1; i >= 0; i--) {
          const job = await this.processItem(
            items[i],
            input.surfaceFields,
            input.key,
            seen,
            skipDelay ?? false,
          );
          if (!job) continue;
          collected.push(job);
          foundNew = true;
          if (collected.length >= MAX_JOBS_COLLECT) break;
        }
      } else {
        for (let i = 0; i < items.length; i++) {
          const job = await this.processItem(
            items[i],
            input.surfaceFields,
            input.key,
            seen,
            skipDelay ?? false,
          );
          if (!job) continue;
          collected.push(job);
          foundNew = true;
          if (collected.length >= MAX_JOBS_COLLECT) break;
        }
      }

      if (!foundNew && scrollable) {
        const canScroll = scrollable.scrollHeight > scrollable.clientHeight;
        if (!canScroll) break;

        const prev = scrollable.scrollTop;
        const atBoundary =
          direction === "up"
            ? prev <= 0
            : prev >= scrollable.scrollHeight - scrollable.clientHeight;
        if (atBoundary) break;

        const delta = direction === "up" ? -400 : 400;
        scrollable.scrollTop = Math.max(0, scrollable.scrollTop + delta);

        await this.timerService.smallDelay();
        emptyPasses++;
      } else if (foundNew) {
        emptyPasses = 0;
      } else {
        emptyPasses++;
      }
    }

    return collected;
  }

  private async waitForSelector(
    selector: string,
    childSelectorOrTimeout: string | number,
    timeoutMs?: number,
  ): Promise<Element | null> {
    let childSelector: string | undefined;
    if (typeof childSelectorOrTimeout === "string") {
      childSelector = childSelectorOrTimeout;
    } else {
      timeoutMs = childSelectorOrTimeout;
    }

    const first = document.querySelector(selector);
    if (first && (!childSelector || first.querySelector(childSelector))) {
      return first;
    }

    const deadline = Date.now() + (timeoutMs ?? 30_000);
    const pollIntervalMs = 300;

    return new Promise((resolve) => {
      const poll = (): void => {
        const el = document.querySelector(selector);
        if (el && (!childSelector || el.querySelector(childSelector))) {
          resolve(el);
        } else if (Date.now() < deadline) {
          setTimeout(poll, pollIntervalMs);
        } else {
          resolve(el ?? null);
        }
      };
      setTimeout(poll, Math.min(pollIntervalMs, deadline - Date.now()));
    });
  }

  private async processItem(
    item: Element,
    fields: PlanStepCollectJobsSurfaceField[],
    keyTemplate: string | undefined,
    seen: Set<string>,
    skipDelay: boolean,
  ): Promise<Job | null> {
    const job = await this.collectFields(item, fields, skipDelay);

    const key =
      keyTemplate != null && keyTemplate.trim().length > 0
        ? this.stringTemplateService.parse(keyTemplate, job)
        : "";

    if (key.length > 0) {
      if (seen.has(key)) return null;
      seen.add(key);
    }

    return job;
  }

  private async collectFields(
    item: Element,
    fields: PlanStepCollectJobsSurfaceField[],
    skipDelay: boolean,
  ): Promise<Job> {
    const domFields = fields.filter(
      (f): f is PlanStepCollectJobsSurfaceField & { selector: string } =>
        f.type !== "regex",
    );
    const regexFields = fields.filter(
      (f): f is RegexSurfaceField => f.type === "regex",
    );

    // Pass 1: collect DOM fields
    const mappedItem: Job = {};
    for (const field of domFields) {
      item.scrollIntoView({ behavior: "instant" });
      if (!skipDelay) {
        await this.timerService.smallDelay();
      }

      const element = item.matches(field.selector)
        ? item
        : item.querySelector(field.selector);
      if (!element) throw new Error(`Element not found: ${field.selector}`);

      mappedItem[field.key] = this.fieldValueService.getFieldValue(
        element as HTMLElement | HTMLInputElement,
        field,
      );
    }

    // Pass 2: resolve regex fields using already-collected data
    for (const field of regexFields) {
      const sourceText = this.resolveRegexText(mappedItem, field.sourceField);
      if (!sourceText) {
        mappedItem[field.key] = null;
        continue;
      }

      const [err, match] = tryRun(() => {
        const regex = new RegExp(field.value, field.flags ?? "");
        return regex.exec(sourceText);
      });

      if (err) {
        if (field.required) throw err;
        mappedItem[field.key] = null;
        continue;
      }

      const group = field.group ?? 1;
      mappedItem[field.key] =
        match != null && match[group] !== undefined ? match[group] : null;
    }

    return mappedItem;
  }

  private resolveRegexText(job: Job, sourceField?: string): string {
    if (sourceField != null) {
      const val = job[sourceField];
      return typeof val === "string" ? val : String(val ?? "");
    }

    const parts: string[] = [];
    for (const val of Object.values(job)) {
      if (typeof val === "string") parts.push(val);
    }
    return parts.join("\n");
  }
}
