import { FieldValueService } from "@/domains/dom/field-value.service";
import type { Job } from "@/domains/dom/types";
import { PopupLogService } from "@/domains/log/popup-log.service";
import type { ContentActionMessage } from "@/domains/message/types";
import { TimerService } from "@/domains/timer/timer.service";

export class JobsListService {
  constructor(
    private readonly fieldValueService: FieldValueService,
    private readonly timerService: TimerService,
    private readonly popupLogService: PopupLogService,
  ) {}

  async execute(message: Extract<ContentActionMessage, { kind: "jobs.list" }>) {
    const { input, skipDelay } = message.action;

    await this.popupLogService.publishDebug("JobsListService executing", {
      itemSelector: input.itemSelector,
      skipDelay,
    });

    const container = document.querySelector(input.containerSector);
    if (!container) {
      throw new Error(`Container not found: ${input.containerSector}`);
    }

    const items = container.querySelectorAll(input.itemSelector);
    if (items.length === 0)
      throw new Error(`No items found: ${input.itemSelector}`);

    await this.popupLogService.publishDebug("JobsListService items found", {
      count: items.length,
    });

    const result: Job[] = [];
    for (const item of Array.from(items)) {
      const mappedItem: Job = {};

      for (const field of input.surfaceFields) {
        item.scrollIntoView({ behavior: "instant" });
        if (!skipDelay) {
          await this.timerService.smallDelay();
        }

        const element = item.querySelector<HTMLElement | HTMLInputElement>(
          field.selector,
        );
        if (!element) throw new Error(`Element not found: ${field.selector}`);

        mappedItem[field.key] = this.fieldValueService.getFieldValue(
          element,
          field,
        );
      }

      result.push(mappedItem);
    }

    return result;
  }
}
