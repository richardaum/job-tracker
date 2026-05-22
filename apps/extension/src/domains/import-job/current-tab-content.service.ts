import {
  CONTEXT_MENU_IMPORT_PAGE_TITLE,
  CONTEXT_MENU_IMPORT_SELECTION_TITLE,
} from "./import-job-labels";

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
    this.removeNonContentElements(root);
    return { url, title, innerHTML: root.innerHTML };
  }

  getImportMenuLabel(): string {
    return this.hasTextSelection()
      ? CONTEXT_MENU_IMPORT_SELECTION_TITLE
      : CONTEXT_MENU_IMPORT_PAGE_TITLE;
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

  private hasTextSelection(): boolean {
    const selection = window.getSelection();
    if (
      selection == null ||
      selection.isCollapsed ||
      selection.rangeCount === 0
    ) {
      return false;
    }
    return selection.toString().trim().length > 0;
  }

  private removeNonContentElements(parent: ParentNode): void {
    const nonContentSelector =
      "script,style,noscript,template,canvas,svg,img,video,button,iframe";
    for (const element of parent.querySelectorAll(nonContentSelector)) {
      element.remove();
    }

    if (parent instanceof Element) {
      parent.removeAttribute("style");
    }
    for (const element of parent.querySelectorAll("[style]")) {
      element.removeAttribute("style");
    }
  }
}
