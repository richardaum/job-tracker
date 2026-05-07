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

    try {
      const { data } = await this.apiService.createDraftApplication({
        url: snapshot.url,
        htmlContent: snapshot.innerHTML,
      });

      const id = data?.createDraftApplication.id;
      if (!id) throw new Error("Failed to create draft application");

      await this.tabService.openTab(`${WEB_URL}/draft-applications/${id}`, {
        focus: true,
      });
    } catch (error) {
      throw new Error("Failed to create draft application", { cause: error });
    }
  }

  async getImportMenuLabel(): Promise<string> {
    try {
      const tabId = await this.tabService.getCurrentTab();
      const response = await this.messagingService.request<
        "import.application.menu-label",
        { label: string }
      >({
        to: "content",
        payload: { kind: "import.application.menu-label" },
        tabId,
      });

      return response.label;
    } catch {
      return CONTEXT_MENU_IMPORT_PAGE_TITLE;
    }
  }
}
