import { defineBackground } from "wxt/utils/define-background";

import { JobDetailsMessagingService } from "@/domains/job-details/job-details-messaging.service";
import { JobsListMessagingService } from "@/domains/jobs-list/jobs-list-messaging.service";
import { LogService } from "@/domains/log/log.service";
import { MessagingService } from "@/domains/message/messaging.service";
import { PaginationMessagingService } from "@/domains/pagination/pagination-messaging.service";
import remoteyeahPlan from "@/domains/plan/fixtures/remoteyeah.plan.json";
import { parsePlan } from "@/domains/plan/parse/parser";
import { CollectJobsService } from "@/domains/plan/services/collect-jobs.service";
import { PlanService } from "@/domains/plan/services/plan.service";
import { StringTemplateService } from "@/domains/plan/services/string-template.service";
import { WxtTabService } from "@/domains/tab/wxt-tab.service";

export default defineBackground(() => {
  const logService = new LogService({ prefix: "Background", level: "debug" });
  const messagingService = new MessagingService("background");

  messagingService.on("log.event", (payload) => {
    const details = payload.data?.[0];
    if (details && typeof details === "object" && !Array.isArray(details)) {
      logService.debug(`content-log ${payload.message}`, details);
      return;
    }

    logService.debug(`content-log ${payload.message}`);
  });
  messagingService.start();

  const planService = new PlanService(
    new CollectJobsService(
      new JobsListMessagingService(messagingService),
      new JobDetailsMessagingService(messagingService),
      new PaginationMessagingService(messagingService),
      new WxtTabService(),
      new StringTemplateService(),
    ),
    logService,
  );

  chrome.runtime.onInstalled.addListener((details) => {
    console.info(
      "[job-tracker] extension installed:",
      details.reason,
      "v" + chrome.runtime.getManifest().version,
    );
  });

  chrome.action.onClicked.addListener(() => {
    const plan = parsePlan(remoteyeahPlan);
    void planService.execute(plan);
  });
});
