/** `close()` exists in Chrome 141+; typings may lag. */
export function readSidePanelClose(
  panel: typeof chrome.sidePanel | undefined,
): ((opts: { windowId: number }) => Promise<void>) | undefined {
  if (panel == null) {
    return undefined;
  }
  const c = (panel as { close?: (opts: { windowId: number }) => Promise<void> })
    .close;
  return typeof c === "function" ? c : undefined;
}

/** True when `chrome.sidePanel.close` exists (Chrome 141+). */
export function chromeSidePanelCloseAvailable(): boolean {
  return (
    chrome.sidePanel != null && readSidePanelClose(chrome.sidePanel) != null
  );
}
