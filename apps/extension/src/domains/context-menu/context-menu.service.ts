import { ImportApplicationService } from "@/domains/import-application/import-application.service";
import {
  CONTEXT_MENU_IMPORT_PAGE_TITLE,
  CONTEXT_MENU_IMPORT_SELECTION_TITLE,
} from "@/domains/import-application/import-application-labels";

const CONTEXT_MENU_IMPORT_PAGE_ID = "import-application-page";
const CONTEXT_MENU_IMPORT_SELECTION_ID = "import-application-selection";

export class ContextMenuService {
  constructor(
    private readonly importApplicationService: ImportApplicationService,
  ) {}

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
    chrome.contextMenus.onClicked.addListener((info) => {
      if (!this.isImportMenuItem(info.menuItemId)) return;
      void this.importApplicationService.execute();
    });
  }

  private isImportMenuItem(menuItemId: string | number): boolean {
    return (
      menuItemId === CONTEXT_MENU_IMPORT_PAGE_ID ||
      menuItemId === CONTEXT_MENU_IMPORT_SELECTION_ID
    );
  }
}
