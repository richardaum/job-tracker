import { sanitizeCapturedHtml } from "@job-tracker/html-sanitize";

import { CONTEXT_MENU_IMPORT_TITLE } from "./import-job-labels";

export type DraftJobSnapshot = {
  url: string;
  title: string;
  innerHTML: string;
};

export class CurrentTabContentService {
  execute(): DraftJobSnapshot {
    const title = document.title;
    const url = window.location.href;
    const root = this.buildImportRoot();
    return { url, title, innerHTML: sanitizeCapturedHtml(root.innerHTML) };
  }

  getImportMenuLabel(): string {
    return CONTEXT_MENU_IMPORT_TITLE;
  }

  /** Full page (`body` clone) or wrapper around the current text selection. */
  private buildImportRoot(): HTMLElement {
    const selection = window.getSelection();
    if (
      selection != null &&
      !selection.isCollapsed &&
      selection.rangeCount > 0 &&
      selection.toString().trim().length > 0
    ) {
      const selectedContainer = document.createElement("div");
      for (let i = 0; i < selection.rangeCount; i += 1) {
        selectedContainer.append(selection.getRangeAt(i).cloneContents());
      }
      return selectedContainer;
    }

    return document.body.cloneNode(true) as HTMLBodyElement;
  }
}
