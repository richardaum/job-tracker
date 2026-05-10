import { tryRun } from "@job-tracker/try-run";

import { ApiService } from "@/domains/api/api.service";
import { MessagingService } from "@/domains/message/messaging.service";
import { WxtTabService } from "@/domains/tab/wxt-tab.service";

import type { DraftApplicationSnapshot } from "./current-tab-content.service";
import { CONTEXT_MENU_IMPORT_PAGE_TITLE } from "./import-application-labels";

const WEB_URL = import.meta.env.WXT_PUBLIC_WEB_URL ?? "http://localhost:3100";

export class ImportApplicationService {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly tabService: WxtTabService,
    private readonly apiService: ApiService,
  ) {}

  async execute(): Promise<void> {
    const tabId = await this.tabService.getCurrentTab();

    const snapshot = await this.messagingService.request<
      "import.application",
      DraftApplicationSnapshot
    >({ to: "content", payload: { kind: "import.application" }, tabId });

    const [error, result] = await tryRun(
      this.apiService.createDraftApplication({
        url: snapshot.url,
        title: snapshot.title,
        htmlContent: snapshot.innerHTML,
      }),
    );

    if (error) {
      throw new Error("Failed to create draft application", { cause: error });
    }

    const id = result?.data?.createDraftApplication.id;
    if (!id) throw new Error("Failed to create draft application");

    await this.tabService.openTab(
      `${WEB_URL}/draft-applications/${id}?autoConvert=true`,
      { focus: true },
    );
  }

  async getImportMenuLabel(): Promise<string> {
    const [tabErr, tabId] = await tryRun(this.tabService.getCurrentTab());
    if (tabErr) {
      return CONTEXT_MENU_IMPORT_PAGE_TITLE;
    }

    const [msgErr, response] = await tryRun(
      this.messagingService.request<
        "import.application.menu-label",
        { label: string }
      >({
        to: "content",
        payload: { kind: "import.application.menu-label" },
        tabId,
      }),
    );

    if (msgErr) {
      return CONTEXT_MENU_IMPORT_PAGE_TITLE;
    }

    return response.label;
  }
}
