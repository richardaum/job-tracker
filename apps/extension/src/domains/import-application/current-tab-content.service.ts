import {
  CONTEXT_MENU_IMPORT_PAGE_TITLE,
  CONTEXT_MENU_IMPORT_SELECTION_TITLE,
} from "./import-application-labels";

export type DraftApplicationSnapshot = { url: string; innerHTML: string };

export class CurrentTabContentService {
  execute(): DraftApplicationSnapshot {
    const selectedContent = this.getSelectedContent();
    if (selectedContent != null) {
      return { url: window.location.href, innerHTML: selectedContent };
    }

    const bodyClone = document.body.cloneNode(true) as HTMLBodyElement;
    this.removeNonContentElements(bodyClone);

    return { url: window.location.href, innerHTML: bodyClone.innerHTML };
  }

  getImportMenuLabel(): string {
    return this.getSelectedContent() == null
      ? CONTEXT_MENU_IMPORT_PAGE_TITLE
      : CONTEXT_MENU_IMPORT_SELECTION_TITLE;
  }

  private getSelectedContent(): string | null {
    const selection = window.getSelection();
    if (
      selection == null ||
      selection.isCollapsed ||
      selection.rangeCount === 0
    ) {
      return null;
    }

    if (selection.toString().trim().length === 0) {
      return null;
    }

    const selectedContainer = document.createElement("div");
    for (let i = 0; i < selection.rangeCount; i += 1) {
      selectedContainer.append(selection.getRangeAt(i).cloneContents());
    }

    this.removeNonContentElements(selectedContainer);
    return selectedContainer.innerHTML;
  }

  private removeNonContentElements(parent: ParentNode): void {
    const nonContentSelector =
      "script,style,noscript,template,canvas,svg,img,video,button,iframe";
    for (const element of parent.querySelectorAll(nonContentSelector)) {
      element.remove();
    }
  }
}
