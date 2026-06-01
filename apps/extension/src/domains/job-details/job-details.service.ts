import { tryRun } from "@job-tracker/try-run";

import { FieldValueService } from "@/domains/dom/field-value.service";
import type { Job } from "@/domains/dom/types";
import type { ContentActionMessage } from "@/domains/message/types";
import { TimerService } from "@/domains/timer/timer.service";

export class JobDetailsService {
  constructor(
    private readonly fieldValueService: FieldValueService,
    private readonly timerService: TimerService,
  ) {}

  async execute(message: Extract<ContentActionMessage, { kind: "job.details" }>) {
    const { input } = message.action;
    const result: Job = {};

    for (const field of input.detailsFields) {
      await this.timerService.smallDelay();
      const element = document.querySelector<HTMLElement | HTMLInputElement>(field.selector);
      if (!element) {
        continue;
      }

      const [fieldErr, value] = tryRun(() => this.fieldValueService.getFieldValue(element, field));
      if (!fieldErr) {
        result[field.key] = value;
      }
    }

    return result;
  }
}
