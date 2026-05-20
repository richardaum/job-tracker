import { ImportJobService } from "@/domains/import-job/import-job.service";
import {
  CONTEXT_MENU_IMPORT_PAGE_TITLE,
  CONTEXT_MENU_IMPORT_SELECTION_TITLE,
} from "@/domains/import-job/import-job-labels";

const CONTEXT_MENU_IMPORT_PAGE_ID = "import-job-page";
const CONTEXT_MENU_IMPORT_SELECTION_ID = "import-job-selection";

export class ContextMenuService {
  constructor(private readonly importJobService: ImportJobService) {}

  async setup(): Promise<void> {
    await chrome.contextMenus.removeAll();
    await chrome.contextMenus.create({
      id: CONTEXT_MENU_IMPORT_PAGE_ID,
      title: CONTEXT_MENU_IMPORT_PAGE_TITLE,
      contexts: ["page"],
    });
    await chrome.contextMenus.create({
      id: CONTEXT_MENU_IMPORT_SELECTION_ID,
      title: CONTEXT_MENU_IMPORT_SELECTION_TITLE,
      contexts: ["selection"],
    });
  }

  bindListeners(): void {
    if (chrome.contextMenus.onClicked.hasListeners()) return;

    chrome.contextMenus.onClicked.addListener((info) => {
      if (!this.isImportMenuItem(info.menuItemId)) return;
      void this.importJobService.execute();
    });
  }

  private isImportMenuItem(menuItemId: string | number): boolean {
    return (
      menuItemId === CONTEXT_MENU_IMPORT_PAGE_ID ||
      menuItemId === CONTEXT_MENU_IMPORT_SELECTION_ID
    );
  }
}
