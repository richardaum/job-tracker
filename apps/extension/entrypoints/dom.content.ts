import { defineContentScript } from "wxt/utils/define-content-script";

import { DomListenerService } from "@/domains/dom/dom-listener.service";
import { FieldValueService } from "@/domains/dom/field-value.service";
import { CurrentTabContentService } from "@/domains/import-application/current-tab-content.service";
import { JobDetailsService } from "@/domains/job-details/job-details.service";
import { JobsListService } from "@/domains/jobs-list/jobs-list.service";
import { PopupLogService } from "@/domains/log/popup-log.service";
import { MessagingService } from "@/domains/message/messaging.service";
import type { RequestType } from "@/domains/message/types";
import { NextButtonService } from "@/domains/pagination/next-button.service";
import { PaginationService } from "@/domains/pagination/pagination.service";
import { DefaultTimerService } from "@/domains/timer/timer.service";

export default defineContentScript({
  matches: [
    "https://jobs.ashbyhq.com/*",
    "https://jobs.lever.co/*",
    "https://jobs.micro1.ai/*",
    "https://www.linkedin.com/*",
    "*://*.remoteyeah.com/*",
  ],
  main() {
    const messagingService = new MessagingService("content");
    const popupLogService = new PopupLogService(messagingService);
    const currentTabContentService = new CurrentTabContentService();

    const domListenerService = new DomListenerService(
      new JobsListService(
        new FieldValueService(),
        new DefaultTimerService(),
        popupLogService,
      ),
      new JobDetailsService(new FieldValueService(), new DefaultTimerService()),
      new PaginationService(new NextButtonService()),
      currentTabContentService,
      popupLogService,
    );

    const contentRequestTypes = [
      "jobs.list",
      "job.details",
      "navigate.next.page",
      "can.navigate.next.page",
      "import.application",
      "import.application.menu-label",
    ] as const;

    contentRequestTypes.forEach((requestType) => {
      messagingService.handle(requestType as RequestType, async (payload) => {
        const startedAt = performance.now();
        const result = await domListenerService.execute(payload);
        const durationMs = Math.round(performance.now() - startedAt);

        await popupLogService.publishDebug("content.request", {
          requestType,
          durationMs,
        });
        return result;
      });
    });

    messagingService.start();
  },
});
