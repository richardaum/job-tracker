import "@/globals.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SidePanel } from "@/components/sidepanel/SidePanel";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Missing #root element");
}

createRoot(rootEl).render(
  <StrictMode>
    <SidePanel />
  </StrictMode>,
);
