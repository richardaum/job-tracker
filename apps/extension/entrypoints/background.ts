import { defineBackground } from "wxt/utils/define-background";

import { api, onAuthRefresh } from "@/gql/api";
import { ContextMenuService } from "@/domains/context-menu/context-menu.service";
import { ExtensionActivityReporterService } from "@/domains/extension-activity/extension-activity-reporter.service";
import { ImportJobService } from "@/domains/import-job/import-job.service";
import { JobDetailsMessagingService } from "@/domains/job-details/job-details-messaging.service";
import { JobsListMessagingService } from "@/domains/jobs-list/jobs-list-messaging.service";
import { LogService } from "@/domains/log/log.service";
import { MessagingService } from "@/domains/message/messaging.service";
import { registerMessageListenerByKind } from "@/domains/message/runtime-message-listener";
import { PaginationMessagingService } from "@/domains/pagination/pagination-messaging.service";
import { CollectJobsService } from "@/domains/plan/services/collect-jobs.service";
import { ParseRegexService } from "@/domains/plan/services/parse-regex.service";
import { PlanService } from "@/domains/plan/services/plan.service";
import { StringTemplateService } from "@/domains/plan/services/string-template.service";
import { SourceRunEventsService } from "@/domains/sources/source-run-events.service";
import { WxtTabService } from "@/domains/tab/wxt-tab.service";
import { AdminExtensionStatusService } from "@/domains/web-bridge/admin-extension-status.service";
import { ExtensionActivityEventType } from "@/gql/graphql";

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
    new ParseRegexService(),
    logService,
  );

  const activityReporterDeps = { extensionVersion: chrome.runtime.getManifest().version, browser: navigator.userAgent };
  const activityReporter = new ExtensionActivityReporterService(logService, activityReporterDeps);

  onAuthRefresh((success) => {
    activityReporter.report(
      success ? ExtensionActivityEventType.AuthRefreshed : ExtensionActivityEventType.AuthFailed,
      success ? "Session token refreshed" : "Session token refresh failed",
      { sourceRunId: "auth" },
    );
  });

  const importJobService = new ImportJobService(messagingService, new WxtTabService(), activityReporter);

  const adminExtensionStatusService = new AdminExtensionStatusService({
    fetchAuthenticatedEmail: () =>
      api
        .Me()
        .then((r) => r.me?.email ?? null)
        .catch(() => null),
  });

  const sourceRunEventsService = new SourceRunEventsService(logService, planService, activityReporter);
  void sourceRunEventsService.recoverOutstandingRuns();

  const contextMenuService = new ContextMenuService(importJobService);
  void contextMenuService.setup();
  contextMenuService.bindListeners();

  chrome.runtime.onInstalled.addListener((details) => {
    console.info("[job-tracker] extension installed:", details.reason, "v" + chrome.runtime.getManifest().version);

    void contextMenuService.setup();
  });
  registerMessageListenerByKind({
    "admin.get-status": (message) => adminExtensionStatusService.handleGetStatusMessage(message),
    "source-run.start": (message) => {
      void sourceRunEventsService.executeSourceRun(message);
    },
    "report.skipped": (message) => {
      const msg = message as { summary?: string; sourceRunId?: string; sourceFieldContent?: string };
      activityReporter.report(ExtensionActivityEventType.SourceRunJobSkipped, msg.summary ?? "job skipped by filter", {
        sourceRunId: msg.sourceRunId ?? null,
        payload: msg.sourceFieldContent ? { sourceFieldContent: msg.sourceFieldContent } : null,
      });
    },
  });
});
