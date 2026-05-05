export type OpenTabOptions = { focus?: boolean };

export interface TabService {
  openTab(url: string, options?: OpenTabOptions): Promise<number>;
  getCurrentTab(): Promise<number>;
  waitUntilTabComplete(tabId: number): Promise<void>;
  closeTab(tabId: number | undefined): Promise<void>;
}
