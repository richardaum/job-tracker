import { Window } from "happy-dom";

import type { OpenTabOptions, TabService } from "./types";

export function loadHtmlWindow(html: string, pageUrl: string): Window {
  const w = new Window({ url: pageUrl });
  w.document.open();
  w.document.write(html);
  w.document.close();
  return w;
}

/**
 * Happy-DOM `TabManager` double: opens tab URLs in isolated documents when
 * listed in `pagesByUrl`, or falls back to the listing window document.
 */
export class MockedTabManager implements TabService {
  private readonly listingWindow: Window;
  private readonly pagesByUrl: Record<string, string>;
  private readonly tabWindows = new Map<number, Window>();
  private tabSeq = 0;

  constructor(options: {
    listingWindow: Window;
    pagesByUrl: Record<string, string>;
  }) {
    this.listingWindow = options.listingWindow;
    this.pagesByUrl = options.pagesByUrl;
  }

  async openTab(url: string, options?: OpenTabOptions): Promise<number> {
    void options;
    const id = ++this.tabSeq;
    const pageHtml = this.pagesByUrl[url];
    const pageWindow =
      pageHtml != null ? loadHtmlWindow(pageHtml, url) : this.listingWindow;
    this.tabWindows.set(id, pageWindow);
    globalThis.window = pageWindow as unknown as typeof globalThis.window;
    globalThis.document = pageWindow.document as unknown as Document;
    return id;
  }

  async getCurrentTab(): Promise<number> {
    return 1;
  }

  async waitUntilTabComplete(tabId: number): Promise<void> {
    void tabId;
  }

  async closeTab(tabId: number | undefined): Promise<void> {
    if (tabId === undefined) {
      return;
    }
    this.tabWindows.delete(tabId);
    globalThis.window = this
      .listingWindow as unknown as typeof globalThis.window;
    globalThis.document = this.listingWindow.document as unknown as Document;
  }
}
