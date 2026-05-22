import { tryRun } from "@job-tracker/try-run";

import { ApiService } from "@/domains/api/api.service";
import { MessagingService } from "@/domains/message/messaging.service";
import { WxtTabService } from "@/domains/tab/wxt-tab.service";

import type { DraftJobSnapshot } from "./current-tab-content.service";
import { CONTEXT_MENU_IMPORT_PAGE_TITLE } from "./import-job-labels";

const WEB_URL = import.meta.env.WXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

export class ImportJobService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly tabService: WxtTabService,
    private readonly apiService: ApiService,
  ) {}

  async execute(): Promise<void> {
    const tabId = await this.tabService.getCurrentTab();

    const snapshot = await this.messagingService.request<
      "import.job",
      DraftJobSnapshot
    >({ to: "content", payload: { kind: "import.job" }, tabId });

    const [error, result] = await tryRun(
      this.apiService.createDraftCaptureJob({
        company: "",
        title: snapshot.title,
        urls: snapshot.url?.trim() ? [snapshot.url.trim()] : [],
        htmlContent: snapshot.innerHTML,
      }),
    );

    if (error) {
      throw new Error("Failed to create draft job", { cause: error });
    }

    const id = result?.data?.createJob?.id;
    if (!id) throw new Error("Failed to create draft job");

    await this.tabService.openTab(`${WEB_URL}/jobs/${id}?autoConvert=true`, {
      focus: true,
    });
  }

  async getImportMenuLabel(): Promise<string> {
    const [tabErr, tabId] = await tryRun(this.tabService.getCurrentTab());
    if (tabErr) {
      return CONTEXT_MENU_IMPORT_PAGE_TITLE;
    }

    const [msgErr, response] = await tryRun(
      this.messagingService.request<"import.job.menu-label", { label: string }>(
        { to: "content", payload: { kind: "import.job.menu-label" }, tabId },
      ),
    );

    if (msgErr) {
      return CONTEXT_MENU_IMPORT_PAGE_TITLE;
    }

    return response.label;
  }
}
