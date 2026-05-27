import { ImportJobService } from "@/domains/import-job/import-job.service";
import { CONTEXT_MENU_IMPORT_TITLE } from "@/domains/import-job/import-job-labels";

const CONTEXT_MENU_PARENT_ID = "job-tracker";
const CONTEXT_MENU_IMPORT_ID = "import-draft-job";

export class ContextMenuService {
  constructor(private readonly importJobService: ImportJobService) {}

  async setup(): Promise<void> {
    await chrome.contextMenus.removeAll();
    await chrome.contextMenus.create({
      id: CONTEXT_MENU_PARENT_ID,
      title: "Job Tracker",
      contexts: ["page", "selection"],
    });
    await chrome.contextMenus.create({
      id: CONTEXT_MENU_IMPORT_ID,
      parentId: CONTEXT_MENU_PARENT_ID,
      title: CONTEXT_MENU_IMPORT_TITLE,
      contexts: ["page", "selection"],
    });
  }

  bindListeners(): void {
    if (chrome.contextMenus.onClicked.hasListeners()) return;

    chrome.contextMenus.onClicked.addListener((info) => {
      if (info.menuItemId !== CONTEXT_MENU_IMPORT_ID) return;
      void this.importJobService.execute();
    });
  }
}
