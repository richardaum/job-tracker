export type OpenTabOptions = { focus?: boolean; windowId?: number };

export type OpenWindowOptions = { focus?: boolean };

export interface TabService {
  openTab(url: string, options?: OpenTabOptions): Promise<number>;
  openWindow(url: string, options?: OpenWindowOptions): Promise<number>;
  getTabWindowId(tabId: number): Promise<number>;
  getCurrentTab(): Promise<number>;
  waitUntilTabComplete(tabId: number): Promise<void>;
  closeTab(tabId: number | undefined): Promise<void>;
  /** Removes the browser window that contains this tab (e.g. surface opened via {@link TabService.openWindow}). */
  closeWindow(surfaceTabId: number): Promise<void>;
}
