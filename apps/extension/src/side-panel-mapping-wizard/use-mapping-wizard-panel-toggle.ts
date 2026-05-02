import { useCallback, useEffect, useState } from "react";

import {
  chromeSidePanelCloseAvailable,
  readSidePanelClose,
} from "./read-side-panel-close";

type SidePanelChrome = typeof chrome.sidePanel & {
  onClosed?: {
    addListener: (cb: () => void) => void;
    removeListener: (cb: () => void) => void;
  };
};

export function useMappingWizardPanelToggle(options: {
  initialSidePanelOpen: boolean;
}): {
  openError: string | null;
  sidePanelOpen: boolean;
  canToggleClose: boolean;
  panelPressed: boolean;
  toggleMappingWizardPanel: () => Promise<void>;
} {
  const { initialSidePanelOpen } = options;
  const [openError, setOpenError] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(initialSidePanelOpen);

  useEffect(() => {
    const onClosed = chrome.sidePanel as SidePanelChrome;
    const ev = onClosed.onClosed;
    if (ev?.addListener == null) {
      return;
    }
    const syncClosed = () => {
      setSidePanelOpen(false);
    };
    ev.addListener(syncClosed);
    return () => ev.removeListener(syncClosed);
  }, []);

  const toggleMappingWizardPanel = useCallback(async () => {
    setOpenError(null);
    try {
      const panel = chrome.sidePanel;
      if (panel?.open == null) {
        setOpenError(
          "Side panel API missing. Use Chrome 114+ or recent Chromium.",
        );
        return;
      }
      const w = await chrome.windows.getCurrent();
      if (w.id == null) {
        setOpenError("No window id");
        return;
      }
      const windowId = w.id;
      const close = readSidePanelClose(panel);

      if (close == null) {
        await panel.open({ windowId });
        return;
      }

      if (sidePanelOpen) {
        await close({ windowId });
        setSidePanelOpen(false);
      } else {
        await panel.open({ windowId });
        setSidePanelOpen(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setOpenError(msg);
    }
  }, [sidePanelOpen]);

  const canToggleClose = chromeSidePanelCloseAvailable();
  const panelPressed = canToggleClose && sidePanelOpen;

  return {
    openError,
    sidePanelOpen,
    canToggleClose,
    panelPressed,
    toggleMappingWizardPanel,
  };
}
