import type { CSSProperties, JSX } from "react";
import { useCallback, useEffect, useState } from "react";

/** `close()` exists in Chrome 141+; typings may lag. */
function readSidePanelClose(
  panel: typeof chrome.sidePanel | undefined,
): ((opts: { windowId: number }) => Promise<void>) | undefined {
  if (panel == null) {
    return undefined;
  }
  const c = (panel as { close?: (opts: { windowId: number }) => Promise<void> })
    .close;
  return typeof c === "function" ? c : undefined;
}

/** Toolbar popup — extension identity version string and mapping wizard toggle. */
function IndexPopup(): JSX.Element {
  const manifest = chrome.runtime.getManifest();

  const title = manifest?.name ?? "@job-tracker/extension";
  const version = manifest?.version ?? "0.0.0";

  const [openError, setOpenError] = useState<string | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  useEffect(() => {
    const onClosed = chrome.sidePanel as typeof chrome.sidePanel & {
      onClosed?: {
        addListener: (cb: () => void) => void;
        removeListener: (cb: () => void) => void;
      };
    };
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

      // `close()` exists from Chrome 141+; without it only `open()` is available.
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

  const canToggleClose =
    chrome.sidePanel != null && readSidePanelClose(chrome.sidePanel) != null;
  const panelPressed = canToggleClose && sidePanelOpen;

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.sub}>{`v${version}`}</p>
      <button
        style={{ ...styles.btn, ...(panelPressed ? styles.btnOn : {}) }}
        type="button"
        aria-pressed={panelPressed}
        onClick={toggleMappingWizardPanel}
      >
        {canToggleClose && sidePanelOpen
          ? "Hide mapping wizard"
          : "Show mapping wizard"}
      </button>
      {openError != null && openError.length > 0 ? (
        <p style={styles.err} role="status">
          {openError}
        </p>
      ) : null}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    width: 320,
    boxSizing: "border-box",
    margin: 0,
    padding: 12,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  title: { fontSize: 16, fontWeight: 600, margin: "0 0 8px 0" },
  sub: { margin: "0 0 10px 0", fontSize: 13, color: "#525252" },
  btn: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 6,
    border: "1px solid #d4d4d4",
    background: "#fafafa",
  },
  btnOn: { background: "#e5e5e5", borderColor: "#a3a3a3" },
  err: { margin: "8px 0 0 0", fontSize: 12, color: "#b91c1c" },
};

export default IndexPopup;
