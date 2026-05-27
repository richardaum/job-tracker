import { tryRun } from "@job-tracker/try-run";

import { ApiService } from "@/domains/api/api.service";
import type { ExtensionActivityReporterService } from "@/domains/extension-activity/extension-activity-reporter.service";
import { MessagingService } from "@/domains/message/messaging.service";
import { WxtTabService } from "@/domains/tab/wxt-tab.service";
import { ExtensionActivityEventType } from "@/gql/graphql";

import type { DraftJobSnapshot } from "./current-tab-content.service";
import { CONTEXT_MENU_IMPORT_TITLE } from "./import-job-labels";

const WEB_URL = import.meta.env.WXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

export class ImportJobService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly tabService: WxtTabService,
    private readonly apiService: ApiService,
    private readonly activityReporter?: ExtensionActivityReporterService,
  ) {}

  async execute(): Promise<void> {
    const tabId = await this.tabService.getCurrentTab();

    const snapshot = await this.messagingService.request<
      "import.job",
      DraftJobSnapshot
    >({ to: "content", payload: { kind: "import.job" }, tabId });

    const summary =
      snapshot.title.trim() || snapshot.url.trim() || "Current page";
    const correlationId = crypto.randomUUID();

    this.activityReporter?.report(
      ExtensionActivityEventType.ImportJobStarted,
      summary,
      { correlationId },
    );

    const [error, result] = await tryRun(
      this.apiService.createDraftCaptureJob({
        company: "",
        title: snapshot.title,
        urls: snapshot.url?.trim() ? [snapshot.url.trim()] : [],
        htmlContent: snapshot.innerHTML,
        autoFill: true,
      }),
    );

    if (error) {
      this.activityReporter?.report(
        ExtensionActivityEventType.ImportJobFailed,
        summary,
        { correlationId },
      );
      throw new Error("Failed to create draft job", { cause: error });
    }

    const id = result?.data?.createJob?.id;
    if (!id) {
      this.activityReporter?.report(
        ExtensionActivityEventType.ImportJobFailed,
        summary,
        { correlationId },
      );
      throw new Error("Failed to create draft job");
    }

    this.activityReporter?.report(
      ExtensionActivityEventType.ImportJobCompleted,
      summary,
      { correlationId, payload: JSON.stringify({ jobId: id }) },
    );

    await this.tabService.openTab(`${WEB_URL}/jobs/${id}`, { focus: true });
  }

  async getImportMenuLabel(): Promise<string> {
    const [tabErr, tabId] = await tryRun(this.tabService.getCurrentTab());
    if (tabErr) {
      return CONTEXT_MENU_IMPORT_TITLE;
    }

    const [msgErr, response] = await tryRun(
      this.messagingService.request<"import.job.menu-label", { label: string }>(
        { to: "content", payload: { kind: "import.job.menu-label" }, tabId },
      ),
    );

    if (msgErr) {
      return CONTEXT_MENU_IMPORT_TITLE;
    }

    return response.label;
  }
}
