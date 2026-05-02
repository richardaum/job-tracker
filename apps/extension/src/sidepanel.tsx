import type { CSSProperties, JSX } from "react";

import {
  formatExtensionVersionLabel,
  MAPPING_WIZARD_SCAFFOLD,
} from "./lib/mapping-wizard-scaffold";

/** Side panel — mapping wizard scaffold (Chrome side panel UI, no host-page injection). */
function SidePanel(): JSX.Element {
  const manifest = chrome.runtime.getManifest();
  const version = formatExtensionVersionLabel(manifest?.version ?? "0.0.0");

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>{MAPPING_WIZARD_SCAFFOLD.heading}</h1>
      <p style={styles.sub}>{MAPPING_WIZARD_SCAFFOLD.subheading}</p>
      <p style={styles.version}>{version}</p>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  main: {
    boxSizing: "border-box",
    margin: 0,
    padding: 12,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    minWidth: 280,
  },
  title: { fontSize: 16, fontWeight: 600, margin: "0 0 8px 0" },
  sub: {
    margin: "0 0 12px 0",
    fontSize: 13,
    color: "#404040",
    lineHeight: 1.45,
  },
  version: { margin: 0, fontSize: 12, color: "#737373" },
};

export default SidePanel;
